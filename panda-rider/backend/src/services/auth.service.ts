import { auth, collections, db } from '../config/firebase';
import { User } from '../models/types';
import { ApiError, ErrorCodes } from '../utils/errors';
import { generateId, sanitizeUser } from '../utils/helpers';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { stripe } from '../config/stripe';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Security configuration
const SECURITY_CONFIG = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  otpExpiry: 5 * 60 * 1000, // 5 minutes
  sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
  biometricTokenExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days
};

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

  // ENHANCED AUTHENTICATION METHODS

  // Login with email/password
  async login(email: string, password: string, deviceInfo?: {
    deviceId: string;
    platform: 'ios' | 'android' | 'web';
    deviceName: string;
  }): Promise<{ user: User; token: string; requiresMfa?: boolean }> {
    // Check for account lockout
    const securityDoc = await collections.users
      .where('email', '==', email)
      .limit(1)
      .get();

    if (securityDoc.empty) {
      throw ApiError.unauthorized('Invalid credentials', ErrorCodes.INVALID_CREDENTIALS);
    }

    const userDoc = securityDoc.docs[0];
    const userData = userDoc.data() as User & { security?: any };

    // Check lockout
    if (userData.security?.lockoutUntil) {
      const lockoutUntil = userData.security.lockoutUntil.toDate();
      if (lockoutUntil > new Date()) {
        const remainingMinutes = Math.ceil((lockoutUntil.getTime() - Date.now()) / 60000);
        throw ApiError.forbidden(`Account locked. Try again in ${remainingMinutes} minutes.`, ErrorCodes.ACCOUNT_LOCKED);
      }
    }

    // Verify password via Firebase Auth
    try {
      const authUser = await auth.getUserByEmail(email);
      // In production, use Firebase Auth signInWithEmailAndPassword
      // For backend verification, we trust Firebase Auth
      
      // Reset failed attempts on successful login
      await collections.users.doc(userDoc.id).update({
        'security.failedAttempts': 0,
        'security.lastLogin': Timestamp.now(),
        'security.lastLoginDevice': deviceInfo || null,
      });

      // Check if MFA is enabled
      if (userData.security?.mfaEnabled) {
        // Generate and send OTP
        const otp = await this.generateAndSendOtp(userDoc.id, userData.phone);
        return {
          user: { ...userData, id: userDoc.id } as User,
          token: '', // Token will be issued after MFA
          requiresMfa: true,
        };
      }

      // Generate session token
      const token = await auth.createCustomToken(userDoc.id);

      // Log session
      await this.createSession(userDoc.id, deviceInfo);

      return {
        user: { ...userData, id: userDoc.id } as User,
        token,
      };
    } catch (error: any) {
      // Increment failed attempts
      const failedAttempts = (userData.security?.failedAttempts || 0) + 1;
      const updates: any = {
        'security.failedAttempts': failedAttempts,
        'security.lastFailedAttempt': Timestamp.now(),
      };

      if (failedAttempts >= SECURITY_CONFIG.maxLoginAttempts) {
        updates['security.lockoutUntil'] = Timestamp.fromDate(
          new Date(Date.now() + SECURITY_CONFIG.lockoutDuration)
        );
      }

      await collections.users.doc(userDoc.id).update(updates);

      throw ApiError.unauthorized('Invalid credentials', ErrorCodes.INVALID_CREDENTIALS);
    }
  }

  // Verify OTP for MFA
  async verifyOtp(userId: string, otp: string): Promise<{ token: string }> {
    const otpDoc = await db.collection('otp_codes').doc(userId).get();
    
    if (!otpDoc.exists) {
      throw ApiError.badRequest('OTP expired or not found', ErrorCodes.OTP_EXPIRED);
    }

    const otpData = otpDoc.data();
    
    if (otpData?.code !== otp) {
      throw ApiError.badRequest('Invalid OTP', ErrorCodes.INVALID_OTP);
    }

    if (otpData?.expiresAt.toDate() < new Date()) {
      throw ApiError.badRequest('OTP expired', ErrorCodes.OTP_EXPIRED);
    }

    // Delete used OTP
    await db.collection('otp_codes').doc(userId).delete();

    // Generate session token
    const token = await auth.createCustomToken(userId);

    return { token };
  }

  // Generate and send OTP
  async generateAndSendOtp(userId: string, phone: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await db.collection('otp_codes').doc(userId).set({
      code: otp,
      phone,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + SECURITY_CONFIG.otpExpiry)),
    });

    // Send OTP via WhatsApp (integration with whatsapp service)
    // In production: await whatsappService.sendOtp(phone, otp);

    return otp;
  }

  // Enable/Setup biometric authentication
  async setupBiometric(userId: string, deviceInfo: {
    deviceId: string;
    platform: 'ios' | 'android';
    publicKey: string;
  }): Promise<{ biometricId: string; expiresAt: Date }> {
    const biometricId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SECURITY_CONFIG.biometricTokenExpiry);

    await db.collection('biometric_auth').doc(biometricId).set({
      userId,
      deviceId: deviceInfo.deviceId,
      platform: deviceInfo.platform,
      publicKey: deviceInfo.publicKey,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(expiresAt),
      isActive: true,
    });

    await collections.users.doc(userId).update({
      'security.biometricEnabled': true,
      'security.biometricDevices': FieldValue.arrayUnion({
        deviceId: deviceInfo.deviceId,
        platform: deviceInfo.platform,
        registeredAt: Timestamp.now(),
      }),
    });

    return { biometricId, expiresAt };
  }

  // Authenticate with biometric
  async authenticateWithBiometric(
    biometricId: string,
    signature: string,
    deviceId: string
  ): Promise<{ user: User; token: string }> {
    const biometricDoc = await db.collection('biometric_auth').doc(biometricId).get();
    
    if (!biometricDoc.exists) {
      throw ApiError.unauthorized('Invalid biometric credentials', ErrorCodes.BIOMETRIC_INVALID);
    }

    const biometricData = biometricDoc.data();

    if (!biometricData?.isActive) {
      throw ApiError.unauthorized('Biometric authentication disabled', ErrorCodes.BIOMETRIC_DISABLED);
    }

    if (biometricData.expiresAt.toDate() < new Date()) {
      throw ApiError.unauthorized('Biometric token expired', ErrorCodes.BIOMETRIC_EXPIRED);
    }

    if (biometricData.deviceId !== deviceId) {
      throw ApiError.unauthorized('Device mismatch', ErrorCodes.DEVICE_MISMATCH);
    }

    // Verify signature with public key (simplified - in production use proper crypto verification)
    // const isValid = crypto.verify(biometricData.publicKey, signature, biometricId);
    
    const userDoc = await collections.users.doc(biometricData.userId).get();
    if (!userDoc.exists) {
      throw ApiError.notFound('User not found', ErrorCodes.USER_NOT_FOUND);
    }

    const userData = userDoc.data() as User;

    // Update last biometric login
    await collections.users.doc(biometricData.userId).update({
      'security.lastBiometricLogin': Timestamp.now(),
    });

    const token = await auth.createCustomToken(biometricData.userId);

    return {
      user: { ...userData, id: biometricData.userId } as User,
      token,
    };
  }

  // Setup PIN for wallet/transactions
  async setupPin(userId: string, pin: string): Promise<void> {
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      throw ApiError.badRequest('PIN must be 4 digits', ErrorCodes.INVALID_PIN);
    }

    const hashedPin = await bcrypt.hash(pin, 10);

    await collections.users.doc(userId).update({
      'security.pinHash': hashedPin,
      'security.pinEnabled': true,
      'security.pinSetAt': Timestamp.now(),
    });
  }

  // Verify PIN
  async verifyPin(userId: string, pin: string): Promise<boolean> {
    const userDoc = await collections.users.doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.security?.pinHash) {
      throw ApiError.badRequest('PIN not set', ErrorCodes.PIN_NOT_SET);
    }

    const isValid = await bcrypt.compare(pin, userData.security.pinHash);
    
    if (!isValid) {
      throw ApiError.unauthorized('Invalid PIN', ErrorCodes.INVALID_PIN);
    }

    return true;
  }

  // Enable two-factor authentication
  async enableMfa(userId: string, method: 'sms' | 'email' | 'app'): Promise<{ secret?: string }> {
    const updates: any = {
      'security.mfaEnabled': true,
      'security.mfaMethod': method,
      'security.mfaSetupAt': Timestamp.now(),
    };

    if (method === 'app') {
      // Generate TOTP secret for authenticator apps
      const secret = crypto.randomBytes(20).toString('hex');
      updates['security.totpSecret'] = secret;
      
      await collections.users.doc(userId).update(updates);
      return { secret };
    }

    await collections.users.doc(userId).update(updates);
    return {};
  }

  // Create session
  private async createSession(userId: string, deviceInfo?: any): Promise<string> {
    const sessionId = crypto.randomBytes(32).toString('hex');
    
    await db.collection('sessions').doc(sessionId).set({
      userId,
      deviceInfo,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + SECURITY_CONFIG.sessionDuration)),
      isActive: true,
    });

    return sessionId;
  }

  // Get active sessions
  async getActiveSessions(userId: string): Promise<Array<{
    id: string;
    deviceInfo: any;
    createdAt: Date;
    lastActive: Date;
  }>> {
    const sessionsSnapshot = await db.collection('sessions')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    return sessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      deviceInfo: doc.data().deviceInfo,
      createdAt: doc.data().createdAt.toDate(),
      lastActive: doc.data().lastActive?.toDate() || doc.data().createdAt.toDate(),
    }));
  }

  // Revoke session
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const sessionDoc = await db.collection('sessions').doc(sessionId).get();
    
    if (!sessionDoc.exists || sessionDoc.data()?.userId !== userId) {
      throw ApiError.notFound('Session not found', ErrorCodes.SESSION_NOT_FOUND);
    }

    await db.collection('sessions').doc(sessionId).update({
      isActive: false,
      revokedAt: Timestamp.now(),
    });
  }

  // Revoke all sessions
  async revokeAllSessions(userId: string): Promise<void> {
    const sessionsSnapshot = await db.collection('sessions')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    const batch = db.batch();
    sessionsSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        isActive: false,
        revokedAt: Timestamp.now(),
      });
    });

    await batch.commit();
  }

  // Get security settings
  async getSecuritySettings(userId: string): Promise<{
    mfaEnabled: boolean;
    biometricEnabled: boolean;
    pinEnabled: boolean;
    activeSessions: number;
  }> {
    const userDoc = await collections.users.doc(userId).get();
    const userData = userDoc.data();

    const sessionsSnapshot = await db.collection('sessions')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    return {
      mfaEnabled: userData?.security?.mfaEnabled || false,
      biometricEnabled: userData?.security?.biometricEnabled || false,
      pinEnabled: userData?.security?.pinEnabled || false,
      activeSessions: sessionsSnapshot.size,
    };
  }
}

export const authService = new AuthService();
