import { auth, collections, db } from '../config/firebase';
import { User } from '../models/types';
import { ApiError, ErrorCodes } from '../utils/errors';
import { generateId, sanitizeUser } from '../utils/helpers';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { stripe } from '../config/stripe';

export class AuthService {
  // Register a new user
  async register(data: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }): Promise<{ user: User; token: string }> {
    // Check if email already exists
    try {
      await auth.getUserByEmail(data.email);
      throw ApiError.conflict('Email already exists', ErrorCodes.EMAIL_ALREADY_EXISTS);
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        if (error instanceof ApiError) throw error;
        throw error;
      }
    }

    // Check if phone already exists
    try {
      await auth.getUserByPhoneNumber(data.phone);
      throw ApiError.conflict('Phone number already exists', ErrorCodes.PHONE_ALREADY_EXISTS);
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        if (error instanceof ApiError) throw error;
        throw error;
      }
    }

    // Create Firebase Auth user
    const authUser = await auth.createUser({
      email: data.email,
      password: data.password,
      displayName: data.name,
      phoneNumber: data.phone,
    });

    // Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: {
        firebaseUid: authUser.uid,
      },
    });

    // Create user document in Firestore
    const userData: Omit<User, 'id'> = {
      email: data.email,
      phone: data.phone,
      name: data.name,
      role: 'customer',
      rating: 5.0,
      totalTrips: 0,
      wallet: {
        balance: 0,
        currency: 'USD',
      },
      savedAddresses: [],
      stripeCustomerId: stripeCustomer.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await collections.users.doc(authUser.uid).set(userData);

    // Generate custom token
    const token = await auth.createCustomToken(authUser.uid);

    return {
      user: { ...userData, id: authUser.uid } as User,
      token,
    };
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    const userDoc = await collections.users.doc(userId).get();
    
    if (!userDoc.exists) {
      return null;
    }

    return { ...userDoc.data(), id: userId } as User;
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const snapshot = await collections.users
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { ...doc.data(), id: doc.id } as User;
  }

  // Update user profile
  async updateProfile(
    userId: string,
    data: Partial<{ name: string; phone: string; avatar: string }>
  ): Promise<User> {
    const userRef = collections.users.doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw ApiError.notFound('User not found', ErrorCodes.USER_NOT_FOUND);
    }

    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    await userRef.update(updateData);

    // Update Firebase Auth if name changed
    if (data.name) {
      await auth.updateUser(userId, { displayName: data.name });
    }

    const updatedDoc = await userRef.get();
    return { ...updatedDoc.data(), id: userId } as User;
  }

  // Update FCM token
  async updateFcmToken(userId: string, fcmToken: string): Promise<void> {
    await collections.users.doc(userId).update({
      fcmToken,
      updatedAt: Timestamp.now(),
    });
  }

  // Get wallet balance
  async getWallet(userId: string): Promise<{ balance: number; currency: string }> {
    const userDoc = await collections.users.doc(userId).get();
    
    if (!userDoc.exists) {
      throw ApiError.notFound('User not found', ErrorCodes.USER_NOT_FOUND);
    }

    const userData = userDoc.data() as User;
    return userData.wallet;
  }

  // Add funds to wallet
  async addFunds(
    userId: string,
    amount: number,
    paymentMethodId: string
  ): Promise<{ balance: number; transactionId: string }> {
    const userDoc = await collections.users.doc(userId).get();
    
    if (!userDoc.exists) {
      throw ApiError.notFound('User not found', ErrorCodes.USER_NOT_FOUND);
    }

    const userData = userDoc.data() as User;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: userData.wallet.currency.toLowerCase(),
      customer: userData.stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    if (paymentIntent.status !== 'succeeded') {
      throw ApiError.badRequest('Payment failed', ErrorCodes.PAYMENT_FAILED);
    }

    // Update wallet balance
    const newBalance = userData.wallet.balance + amount;
    await collections.users.doc(userId).update({
      'wallet.balance': newBalance,
      updatedAt: Timestamp.now(),
    });

    // Record the transaction
    await collections.payments.add({
      userId,
      type: 'wallet_topup',
      amount,
      currency: userData.wallet.currency,
      status: 'succeeded',
      stripePaymentIntentId: paymentIntent.id,
      createdAt: Timestamp.now(),
    });

    return {
      balance: newBalance,
      transactionId: paymentIntent.id,
    };
  }

  // Deduct from wallet
  async deductFromWallet(userId: string, amount: number): Promise<number> {
    const userRef = collections.users.doc(userId);
    
    return await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw ApiError.notFound('User not found', ErrorCodes.USER_NOT_FOUND);
      }

      const userData = userDoc.data() as User;
      
      if (userData.wallet.balance < amount) {
        throw ApiError.badRequest('Insufficient funds', ErrorCodes.INSUFFICIENT_FUNDS);
      }

      const newBalance = userData.wallet.balance - amount;
      
      transaction.update(userRef, {
        'wallet.balance': newBalance,
        updatedAt: Timestamp.now(),
      });

      return newBalance;
    });
  }

  // Add saved address
  async addSavedAddress(
    userId: string,
    address: { label: string; address: string; lat: number; lng: number }
  ): Promise<void> {
    const savedAddress = {
      id: generateId(),
      ...address,
    };

    await collections.users.doc(userId).update({
      savedAddresses: FieldValue.arrayUnion(savedAddress),
      updatedAt: Timestamp.now(),
    });
  }

  // Remove saved address
  async removeSavedAddress(userId: string, addressId: string): Promise<void> {
    const userDoc = await collections.users.doc(userId).get();
    
    if (!userDoc.exists) {
      throw ApiError.notFound('User not found', ErrorCodes.USER_NOT_FOUND);
    }

    const userData = userDoc.data() as User;
    const updatedAddresses = userData.savedAddresses.filter((a) => a.id !== addressId);

    await collections.users.doc(userId).update({
      savedAddresses: updatedAddresses,
      updatedAt: Timestamp.now(),
    });
  }
}

export const authService = new AuthService();
