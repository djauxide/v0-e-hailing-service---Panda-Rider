import { db } from '../config/firebase';
import { stripe, STRIPE_CURRENCY } from '../config/stripe';
import { whatsappService } from './whatsapp.service';
import { logger } from '../utils/logger';
import { generateId } from '../utils/helpers';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'topup' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'payment' | 'refund' | 'cashback';
  amount: number;
  currency: string;
  reference: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata?: {
    recipientId?: string;
    recipientPhone?: string;
    recipientName?: string;
    senderId?: string;
    senderPhone?: string;
    senderName?: string;
    tripId?: string;
    paymentMethod?: string;
  };
  createdAt: Date;
  completedAt?: Date;
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
  tier: 'basic' | 'premium' | 'business';
  dailyLimit: number;
  monthlyLimit: number;
  isVerified: boolean;
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
  linkedAccounts: Array<{
    type: 'bank' | 'card';
    last4: string;
    bankName?: string;
    isDefault: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export class WalletService {
  private readonly DAILY_LIMIT_BASIC = 5000; // R5,000
  private readonly DAILY_LIMIT_PREMIUM = 25000; // R25,000
  private readonly DAILY_LIMIT_BUSINESS = 100000; // R100,000
  private readonly TRANSFER_FEE_PERCENT = 0.01; // 1% fee
  private readonly MIN_TRANSFER = 10; // R10 minimum
  private readonly MAX_TRANSFER = 50000; // R50,000 maximum

  // Initialize wallet for new user
  async createWallet(userId: string): Promise<Wallet> {
    const wallet: Wallet = {
      userId,
      balance: 0,
      currency: 'ZAR',
      tier: 'basic',
      dailyLimit: this.DAILY_LIMIT_BASIC,
      monthlyLimit: this.DAILY_LIMIT_BASIC * 30,
      isVerified: false,
      kycStatus: 'none',
      linkedAccounts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('wallets').doc(userId).set(wallet);
    return wallet;
  }

  // Get wallet balance
  async getWallet(userId: string): Promise<Wallet | null> {
    const doc = await db.collection('wallets').doc(userId).get();
    if (!doc.exists) return null;
    return doc.data() as Wallet;
  }

  // Top up wallet via card/bank
  async topUp(
    userId: string,
    amount: number,
    paymentMethodId: string
  ): Promise<{ success: boolean; transaction?: WalletTransaction; error?: string }> {
    try {
      if (amount < this.MIN_TRANSFER) {
        return { success: false, error: `Minimum top-up is R${this.MIN_TRANSFER}` };
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: STRIPE_CURRENCY,
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });

      if (paymentIntent.status !== 'succeeded') {
        return { success: false, error: 'Payment failed' };
      }

      // Create transaction
      const transaction = await this.createTransaction({
        userId,
        type: 'topup',
        amount,
        description: 'Wallet top-up',
        reference: `TOP-${generateId()}`,
        metadata: { paymentMethod: paymentMethodId },
      });

      // Update balance
      await this.updateBalance(userId, amount);

      // Get new balance and send WhatsApp notification
      const wallet = await this.getWallet(userId);
      const user = await this.getUser(userId);
      if (user?.phone) {
        await whatsappService.sendWalletTopUp(user.phone, amount, wallet?.balance || amount);
      }

      return { success: true, transaction };
    } catch (error: any) {
      logger.error('Top-up error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send money to another user
  async sendMoney(
    senderId: string,
    recipientPhone: string,
    amount: number,
    note?: string
  ): Promise<{ success: boolean; transaction?: WalletTransaction; error?: string }> {
    try {
      // Validation
      if (amount < this.MIN_TRANSFER) {
        return { success: false, error: `Minimum transfer is R${this.MIN_TRANSFER}` };
      }
      if (amount > this.MAX_TRANSFER) {
        return { success: false, error: `Maximum transfer is R${this.MAX_TRANSFER}` };
      }

      // Get sender wallet
      const senderWallet = await this.getWallet(senderId);
      if (!senderWallet) {
        return { success: false, error: 'Wallet not found' };
      }

      // Check balance
      const fee = amount * this.TRANSFER_FEE_PERCENT;
      const totalDeduction = amount + fee;
      if (senderWallet.balance < totalDeduction) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Check daily limit
      const todaySpent = await this.getTodaySpent(senderId);
      if (todaySpent + amount > senderWallet.dailyLimit) {
        return { success: false, error: `Daily limit of R${senderWallet.dailyLimit} exceeded` };
      }

      // Find recipient by phone
      const recipientUser = await this.findUserByPhone(recipientPhone);
      if (!recipientUser) {
        return { success: false, error: 'Recipient not found. They must have a Panda Rider account.' };
      }

      const sender = await this.getUser(senderId);
      const reference = `TRF-${generateId()}`;

      // Deduct from sender
      await this.updateBalance(senderId, -totalDeduction);
      const senderTransaction = await this.createTransaction({
        userId: senderId,
        type: 'transfer_out',
        amount: -amount,
        description: note || `Sent to ${recipientUser.name}`,
        reference,
        metadata: {
          recipientId: recipientUser.id,
          recipientPhone,
          recipientName: recipientUser.name,
          fee,
        },
      });

      // Credit recipient
      await this.updateBalance(recipientUser.id, amount);
      await this.createTransaction({
        userId: recipientUser.id,
        type: 'transfer_in',
        amount,
        description: note || `Received from ${sender?.name || 'Unknown'}`,
        reference,
        metadata: {
          senderId,
          senderPhone: sender?.phone,
          senderName: sender?.name,
        },
      });

      // Send WhatsApp notifications
      if (sender?.phone) {
        await whatsappService.sendMoneyTransferNotification(
          sender.phone,
          amount,
          recipientUser.name,
          reference,
          'sent'
        );
      }
      if (recipientUser.phone) {
        await whatsappService.sendMoneyTransferNotification(
          recipientUser.phone,
          amount,
          sender?.name || 'A Panda Rider user',
          reference,
          'received'
        );
      }

      return { success: true, transaction: senderTransaction };
    } catch (error: any) {
      logger.error('Send money error:', error);
      return { success: false, error: error.message };
    }
  }

  // Request money from another user
  async requestMoney(
    requesterId: string,
    fromPhone: string,
    amount: number,
    note?: string
  ): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      const requester = await this.getUser(requesterId);
      const fromUser = await this.findUserByPhone(fromPhone);

      if (!fromUser) {
        return { success: false, error: 'User not found' };
      }

      const requestId = `REQ-${generateId()}`;

      await db.collection('money_requests').doc(requestId).set({
        id: requestId,
        requesterId,
        requesterName: requester?.name,
        requesterPhone: requester?.phone,
        fromUserId: fromUser.id,
        fromPhone,
        amount,
        note,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      // Notify via WhatsApp
      if (fromUser.phone) {
        await whatsappService.sendInteractiveMessage(
          fromUser.phone,
          `${requester?.name || 'A user'} is requesting R${amount.toFixed(2)}${note ? `\n\nNote: ${note}` : ''}`,
          [
            { id: `pay_${requestId}`, title: 'Pay Now' },
            { id: `decline_${requestId}`, title: 'Decline' },
          ]
        );
      }

      return { success: true, requestId };
    } catch (error: any) {
      logger.error('Request money error:', error);
      return { success: false, error: error.message };
    }
  }

  // Withdraw to bank account
  async withdraw(
    userId: string,
    amount: number,
    bankAccountId: string
  ): Promise<{ success: boolean; transaction?: WalletTransaction; error?: string }> {
    try {
      const wallet = await this.getWallet(userId);
      if (!wallet) {
        return { success: false, error: 'Wallet not found' };
      }

      if (wallet.balance < amount) {
        return { success: false, error: 'Insufficient balance' };
      }

      if (!wallet.isVerified) {
        return { success: false, error: 'Please verify your identity to withdraw' };
      }

      // Deduct balance
      await this.updateBalance(userId, -amount);

      const transaction = await this.createTransaction({
        userId,
        type: 'withdrawal',
        amount: -amount,
        description: 'Withdrawal to bank',
        reference: `WD-${generateId()}`,
        metadata: { bankAccountId },
      });

      // In production, initiate actual bank transfer here
      // For now, mark as pending (would be processed by batch job)

      return { success: true, transaction };
    } catch (error: any) {
      logger.error('Withdrawal error:', error);
      return { success: false, error: error.message };
    }
  }

  // Pay for a trip from wallet
  async payForTrip(
    userId: string,
    tripId: string,
    amount: number
  ): Promise<{ success: boolean; transaction?: WalletTransaction; error?: string }> {
    try {
      const wallet = await this.getWallet(userId);
      if (!wallet || wallet.balance < amount) {
        return { success: false, error: 'Insufficient wallet balance' };
      }

      await this.updateBalance(userId, -amount);

      const transaction = await this.createTransaction({
        userId,
        type: 'payment',
        amount: -amount,
        description: 'Trip payment',
        reference: `PAY-${generateId()}`,
        metadata: { tripId },
      });

      return { success: true, transaction };
    } catch (error: any) {
      logger.error('Trip payment error:', error);
      return { success: false, error: error.message };
    }
  }

  // Add cashback reward
  async addCashback(userId: string, amount: number, tripId: string): Promise<void> {
    await this.updateBalance(userId, amount);
    await this.createTransaction({
      userId,
      type: 'cashback',
      amount,
      description: 'Trip cashback reward',
      reference: `CB-${generateId()}`,
      metadata: { tripId },
    });
  }

  // Get transaction history
  async getTransactions(
    userId: string,
    limit: number = 20,
    startAfter?: string
  ): Promise<WalletTransaction[]> {
    let query = db.collection('wallet_transactions')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (startAfter) {
      const startDoc = await db.collection('wallet_transactions').doc(startAfter).get();
      query = query.startAfter(startDoc);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data() as WalletTransaction);
  }

  // Link bank account
  async linkBankAccount(
    userId: string,
    bankName: string,
    accountNumber: string,
    branchCode: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const last4 = accountNumber.slice(-4);
      
      await db.collection('wallets').doc(userId).update({
        linkedAccounts: FieldValue.arrayUnion({
          type: 'bank',
          last4,
          bankName,
          branchCode,
          isDefault: false,
          addedAt: new Date(),
        }),
        updatedAt: new Date(),
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Upgrade wallet tier
  async upgradeTier(userId: string, tier: 'premium' | 'business'): Promise<void> {
    const limits = {
      premium: { daily: this.DAILY_LIMIT_PREMIUM, monthly: this.DAILY_LIMIT_PREMIUM * 30 },
      business: { daily: this.DAILY_LIMIT_BUSINESS, monthly: this.DAILY_LIMIT_BUSINESS * 30 },
    };

    await db.collection('wallets').doc(userId).update({
      tier,
      dailyLimit: limits[tier].daily,
      monthlyLimit: limits[tier].monthly,
      updatedAt: new Date(),
    });
  }

  // Helper: Update wallet balance
  private async updateBalance(userId: string, amount: number): Promise<void> {
    await db.collection('wallets').doc(userId).update({
      balance: FieldValue.increment(amount),
      updatedAt: new Date(),
    });
  }

  // Helper: Create transaction record
  private async createTransaction(data: Partial<WalletTransaction>): Promise<WalletTransaction> {
    const transaction: WalletTransaction = {
      id: generateId(),
      userId: data.userId!,
      type: data.type!,
      amount: data.amount!,
      currency: 'ZAR',
      reference: data.reference!,
      description: data.description!,
      status: 'completed',
      metadata: data.metadata,
      createdAt: new Date(),
      completedAt: new Date(),
    };

    await db.collection('wallet_transactions').doc(transaction.id).set(transaction);
    return transaction;
  }

  // Helper: Get today's spent amount
  private async getTodaySpent(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const snapshot = await db.collection('wallet_transactions')
      .where('userId', '==', userId)
      .where('type', 'in', ['transfer_out', 'payment'])
      .where('createdAt', '>=', startOfDay)
      .get();

    return snapshot.docs.reduce((sum, doc) => {
      const amount = Math.abs(doc.data().amount);
      return sum + amount;
    }, 0);
  }

  // Helper: Find user by phone
  private async findUserByPhone(phone: string): Promise<any | null> {
    const normalizedPhone = phone.replace(/\D/g, '');
    const snapshot = await db.collection('users')
      .where('phone', '==', normalizedPhone)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }

  // Helper: Get user
  private async getUser(userId: string): Promise<any | null> {
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }
}

export const walletService = new WalletService();
