/**
 * PAYMENT GATEWAY SERVICE
 * 
 * Multi-provider payment integration supporting:
 * - Stripe (International cards)
 * - PayFast (South African gateway)
 * - Ozow (EFT/Instant payments)
 * - SnapScan (QR payments)
 * - Panda Wallet (Internal)
 * - Cash (Driver collection)
 */

import { stripe, STRIPE_CURRENCY } from '../config/stripe';
import { collections, db } from '../config/firebase';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { whatsappService } from './whatsapp.service';
import crypto from 'crypto';

// PayFast configuration
const PAYFAST_CONFIG = {
  merchantId: process.env.PAYFAST_MERCHANT_ID || '',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
  passphrase: process.env.PAYFAST_PASSPHRASE || '',
  testMode: process.env.NODE_ENV !== 'production',
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://www.payfast.co.za/eng/process'
    : 'https://sandbox.payfast.co.za/eng/process',
};

// Ozow configuration
const OZOW_CONFIG = {
  siteCode: process.env.OZOW_SITE_CODE || '',
  privateKey: process.env.OZOW_PRIVATE_KEY || '',
  apiKey: process.env.OZOW_API_KEY || '',
  testMode: process.env.NODE_ENV !== 'production',
  baseUrl: 'https://api.ozow.com',
};

// Surge Pricing Configuration
const SURGE_CONFIG = {
  minMultiplier: 1.0,
  maxMultiplier: 3.5,
  thresholds: [
    { demandRatio: 1.2, multiplier: 1.2 },
    { demandRatio: 1.5, multiplier: 1.5 },
    { demandRatio: 2.0, multiplier: 2.0 },
    { demandRatio: 2.5, multiplier: 2.5 },
    { demandRatio: 3.0, multiplier: 3.0 },
    { demandRatio: 3.5, multiplier: 3.5 },
  ],
  peakHours: [7, 8, 9, 17, 18, 19], // Morning and evening rush
  weekendMultiplier: 1.1,
  holidayMultiplier: 1.3,
  badWeatherMultiplier: 1.5,
};

interface PaymentResult {
  success: boolean;
  paymentId: string;
  transactionRef: string;
  gateway: 'stripe' | 'payfast' | 'ozow' | 'snapscan' | 'wallet' | 'cash' | 'google_pay' | 'apple_pay';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  redirectUrl?: string;
  qrCode?: string;
  error?: string;
  surgeMultiplier?: number;
}

interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
}

export class PaymentGatewayService {
  // Calculate surge multiplier based on current conditions
  async calculateSurgeMultiplier(
    pickupLat: number,
    pickupLng: number,
    serviceType: 'ride' | 'food' | 'courier'
  ): Promise<{ multiplier: number; reason: string; expiresAt: Date }> {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    let multiplier = SURGE_CONFIG.minMultiplier;
    const reasons: string[] = [];

    // Check peak hours
    if (SURGE_CONFIG.peakHours.includes(hour)) {
      multiplier *= 1.3;
      reasons.push('Peak hour demand');
    }

    // Weekend adjustment
    if (isWeekend) {
      multiplier *= SURGE_CONFIG.weekendMultiplier;
      reasons.push('Weekend pricing');
    }

    // Calculate demand/supply ratio from Firestore
    const areaHash = this.getGeohash(pickupLat, pickupLng, 4);
    const driversSnapshot = await db.collection('drivers')
      .where('geohash', '>=', areaHash)
      .where('geohash', '<=', areaHash + '\uf8ff')
      .where('status', '==', 'online')
      .get();

    const requestsSnapshot = await db.collection('trip_requests')
      .where('createdAt', '>=', Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 1000)))
      .where('status', '==', 'pending')
      .get();

    const availableDrivers = driversSnapshot.size || 1;
    const pendingRequests = requestsSnapshot.size;
    const demandRatio = pendingRequests / availableDrivers;

    // Apply demand-based surge
    for (const threshold of SURGE_CONFIG.thresholds) {
      if (demandRatio >= threshold.demandRatio) {
        multiplier = Math.max(multiplier, threshold.multiplier);
        reasons.push(`High demand (${Math.round(demandRatio * 100)}% capacity)`);
        break;
      }
    }

    // Cap at maximum
    multiplier = Math.min(multiplier, SURGE_CONFIG.maxMultiplier);

    // Store surge data for transparency
    await db.collection('surge_pricing').add({
      lat: pickupLat,
      lng: pickupLng,
      geohash: areaHash,
      multiplier,
      reasons,
      demandRatio,
      availableDrivers,
      pendingRequests,
      serviceType,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)),
    });

    return {
      multiplier: Math.round(multiplier * 10) / 10,
      reason: reasons.join(', ') || 'Standard pricing',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    };
  }

  private getGeohash(lat: number, lng: number, precision: number): string {
    const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let minLat = -90, maxLat = 90, minLng = -180, maxLng = 180;
    let hash = '';
    let isEven = true;
    let bit = 0, ch = 0;

    while (hash.length < precision) {
      if (isEven) {
        const mid = (minLng + maxLng) / 2;
        if (lng >= mid) { ch |= 1 << (4 - bit); minLng = mid; }
        else { maxLng = mid; }
      } else {
        const mid = (minLat + maxLat) / 2;
        if (lat >= mid) { ch |= 1 << (4 - bit); minLat = mid; }
        else { maxLat = mid; }
      }
      isEven = !isEven;
      if (bit < 4) { bit++; }
      else { hash += base32[ch]; bit = 0; ch = 0; }
    }
    return hash;
  }

  // Process payment through appropriate gateway
  async processPayment(
    userId: string,
    tripId: string,
    amount: number,
    paymentMethod: 'card' | 'eft' | 'qr' | 'wallet' | 'cash' | 'google_pay' | 'apple_pay',
    options?: {
      cardToken?: string;
      bankRef?: string;
      walletPin?: string;
      saveCard?: boolean;
      googlePayToken?: string;
      applePayToken?: string;
      surgeMultiplier?: number;
    }
  ): Promise<PaymentResult> {
    const paymentId = this.generatePaymentId();
    const transactionRef = `PR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    try {
      let result: PaymentResult;

      switch (paymentMethod) {
        case 'card':
          result = await this.processStripePayment(userId, tripId, amount, paymentId, transactionRef, options?.cardToken, options?.saveCard);
          break;
        case 'eft':
          result = await this.processOzowPayment(userId, tripId, amount, paymentId, transactionRef);
          break;
        case 'qr':
          result = await this.processSnapScanPayment(userId, tripId, amount, paymentId, transactionRef);
          break;
        case 'wallet':
          result = await this.processWalletPayment(userId, tripId, amount, paymentId, transactionRef, options?.walletPin);
          break;
        case 'cash':
          result = await this.processCashPayment(userId, tripId, amount, paymentId, transactionRef);
          break;
        case 'google_pay':
          result = await this.processGooglePayPayment(userId, tripId, amount, paymentId, transactionRef, options?.googlePayToken);
          break;
        case 'apple_pay':
          result = await this.processApplePayPayment(userId, tripId, amount, paymentId, transactionRef, options?.applePayToken);
          break;
        default:
          throw new Error('Invalid payment method');
      }

      // Add surge multiplier to result if applicable
      if (options?.surgeMultiplier && options.surgeMultiplier > 1) {
        result.surgeMultiplier = options.surgeMultiplier;
      }

      // Store payment record
      await this.storePaymentRecord(result, userId, tripId);

      return result;
    } catch (error: any) {
      // Store failed payment
      await this.storePaymentRecord({
        success: false,
        paymentId,
        transactionRef,
        gateway: paymentMethod === 'card' ? 'stripe' : paymentMethod as any,
        amount,
        currency: 'ZAR',
        status: 'failed',
        error: error.message,
      }, userId, tripId);

      throw error;
    }
  }

  // STRIPE (International Cards)
  private async processStripePayment(
    userId: string,
    tripId: string,
    amount: number,
    paymentId: string,
    transactionRef: string,
    cardToken?: string,
    saveCard?: boolean
  ): Promise<PaymentResult> {
    // Get or create Stripe customer
    let customerId = await this.getStripeCustomerId(userId);

    if (!customerId) {
      const userDoc = await collections.users.doc(userId).get();
      const user = userDoc.data();
      
      const customer = await stripe.customers.create({
        email: user?.email,
        name: user?.firstName + ' ' + user?.lastName,
        phone: user?.phone,
        metadata: { userId },
      });
      customerId = customer.id;
      
      await collections.users.doc(userId).update({
        stripeCustomerId: customerId,
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: STRIPE_CURRENCY,
      customer: customerId,
      payment_method: cardToken,
      confirm: !!cardToken,
      automatic_payment_methods: cardToken ? undefined : {
        enabled: true,
      },
      metadata: {
        paymentId,
        tripId,
        userId,
        transactionRef,
      },
      setup_future_usage: saveCard ? 'on_session' : undefined,
    });

    return {
      success: paymentIntent.status === 'succeeded',
      paymentId,
      transactionRef,
      gateway: 'stripe',
      amount,
      currency: 'ZAR',
      status: this.mapStripeStatus(paymentIntent.status),
      redirectUrl: paymentIntent.status === 'requires_action' 
        ? paymentIntent.next_action?.redirect_to_url?.url 
        : undefined,
    };
  }

  // OZOW (South African EFT)
  private async processOzowPayment(
    userId: string,
    tripId: string,
    amount: number,
    paymentId: string,
    transactionRef: string
  ): Promise<PaymentResult> {
    const userDoc = await collections.users.doc(userId).get();
    const user = userDoc.data();

    // Generate Ozow payment request
    const hashData = [
      OZOW_CONFIG.siteCode,
      'ZA', // Country code
      'ZAR',
      amount.toFixed(2),
      transactionRef,
      '',
      '', // Bank reference
      '',
      process.env.OZOW_SUCCESS_URL,
      process.env.OZOW_CANCEL_URL,
      process.env.OZOW_ERROR_URL,
      process.env.OZOW_NOTIFY_URL,
      'true', // isTest
      OZOW_CONFIG.privateKey,
    ].join('');

    const hash = crypto.createHash('sha512').update(hashData.toLowerCase()).digest('hex');

    const paymentUrl = new URL(`${OZOW_CONFIG.baseUrl}/v1/PostPaymentRequest`);
    
    // In production, make actual API call
    // For now, return redirect URL pattern
    const redirectUrl = `${OZOW_CONFIG.baseUrl}/pay?` + new URLSearchParams({
      SiteCode: OZOW_CONFIG.siteCode,
      CountryCode: 'ZA',
      CurrencyCode: 'ZAR',
      Amount: amount.toFixed(2),
      TransactionReference: transactionRef,
      BankReference: `Panda Trip ${tripId.slice(-6)}`,
      Customer: user?.email || '',
      SuccessUrl: process.env.OZOW_SUCCESS_URL || '',
      CancelUrl: process.env.OZOW_CANCEL_URL || '',
      ErrorUrl: process.env.OZOW_ERROR_URL || '',
      NotifyUrl: process.env.OZOW_NOTIFY_URL || '',
      IsTest: String(OZOW_CONFIG.testMode),
      HashCheck: hash,
    }).toString();

    return {
      success: true,
      paymentId,
      transactionRef,
      gateway: 'ozow',
      amount,
      currency: 'ZAR',
      status: 'pending',
      redirectUrl,
    };
  }

  // SNAPSCAN (QR Code Payments)
  private async processSnapScanPayment(
    userId: string,
    tripId: string,
    amount: number,
    paymentId: string,
    transactionRef: string
  ): Promise<PaymentResult> {
    // Generate SnapScan QR code data
    const snapScanMerchantId = process.env.SNAPSCAN_MERCHANT_ID || 'panda-rider';
    
    // SnapScan QR format
    const qrData = JSON.stringify({
      merchantId: snapScanMerchantId,
      amount: amount.toFixed(2),
      reference: transactionRef,
      strict: true,
    });

    // In production, call SnapScan API to generate QR
    // For now, generate a placeholder QR URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      `snapscan://pay?merchantId=${snapScanMerchantId}&amount=${amount}&ref=${transactionRef}`
    )}`;

    return {
      success: true,
      paymentId,
      transactionRef,
      gateway: 'snapscan',
      amount,
      currency: 'ZAR',
      status: 'pending',
      qrCode: qrCodeUrl,
    };
  }

  // WALLET PAYMENT (Internal)
  private async processWalletPayment(
    userId: string,
    tripId: string,
    amount: number,
    paymentId: string,
    transactionRef: string,
    pin?: string
  ): Promise<PaymentResult> {
    // Verify wallet balance
    const walletDoc = await collections.wallets.doc(userId).get();
    const wallet = walletDoc.data();

    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    // Verify PIN if required
    if (wallet.pinRequired && wallet.pin !== pin) {
      throw new Error('Invalid wallet PIN');
    }

    // Deduct from wallet
    await collections.wallets.doc(userId).update({
      balance: FieldValue.increment(-amount),
      'transactions': FieldValue.arrayUnion({
        id: paymentId,
        type: 'payment',
        amount: -amount,
        description: `Trip payment ${tripId.slice(-6)}`,
        reference: transactionRef,
        timestamp: Timestamp.now(),
      }),
    });

    return {
      success: true,
      paymentId,
      transactionRef,
      gateway: 'wallet',
      amount,
      currency: 'ZAR',
      status: 'completed',
    };
  }

  // CASH PAYMENT (Driver Collection)
  private async processCashPayment(
    userId: string,
    tripId: string,
    amount: number,
    paymentId: string,
    transactionRef: string
  ): Promise<PaymentResult> {
    // Cash payments are marked as pending until driver confirms collection
    return {
      success: true,
      paymentId,
      transactionRef,
      gateway: 'cash',
      amount,
      currency: 'ZAR',
      status: 'pending',
    };
  }

  // GOOGLE PAY (via Stripe)
  private async processGooglePayPayment(
    userId: string,
    tripId: string,
    amount: number,
    paymentId: string,
    transactionRef: string,
    googlePayToken?: string
  ): Promise<PaymentResult> {
    if (!googlePayToken) {
      throw new Error('Google Pay token required');
    }

    let customerId = await this.getStripeCustomerId(userId);
    if (!customerId) {
      const userDoc = await collections.users.doc(userId).get();
      const user = userDoc.data();
      const customer = await stripe.customers.create({
        email: user?.email,
        name: user?.name,
        phone: user?.phone,
        metadata: { userId },
      });
      customerId = customer.id;
      await collections.users.doc(userId).update({ stripeCustomerId: customerId });
    }

    // Create payment method from Google Pay token
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: { token: googlePayToken },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: STRIPE_CURRENCY,
      customer: customerId,
      payment_method: paymentMethod.id,
      confirm: true,
      automatic_payment_methods: { enabled: false },
      metadata: {
        paymentId,
        tripId,
        userId,
        transactionRef,
        paymentType: 'google_pay',
      },
    });

    return {
      success: paymentIntent.status === 'succeeded',
      paymentId,
      transactionRef,
      gateway: 'google_pay',
      amount,
      currency: 'ZAR',
      status: this.mapStripeStatus(paymentIntent.status),
    };
  }

  // APPLE PAY (via Stripe)
  private async processApplePayPayment(
    userId: string,
    tripId: string,
    amount: number,
    paymentId: string,
    transactionRef: string,
    applePayToken?: string
  ): Promise<PaymentResult> {
    if (!applePayToken) {
      throw new Error('Apple Pay token required');
    }

    let customerId = await this.getStripeCustomerId(userId);
    if (!customerId) {
      const userDoc = await collections.users.doc(userId).get();
      const user = userDoc.data();
      const customer = await stripe.customers.create({
        email: user?.email,
        name: user?.name,
        phone: user?.phone,
        metadata: { userId },
      });
      customerId = customer.id;
      await collections.users.doc(userId).update({ stripeCustomerId: customerId });
    }

    // Create payment method from Apple Pay token
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: { token: applePayToken },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: STRIPE_CURRENCY,
      customer: customerId,
      payment_method: paymentMethod.id,
      confirm: true,
      automatic_payment_methods: { enabled: false },
      metadata: {
        paymentId,
        tripId,
        userId,
        transactionRef,
        paymentType: 'apple_pay',
      },
    });

    return {
      success: paymentIntent.status === 'succeeded',
      paymentId,
      transactionRef,
      gateway: 'apple_pay',
      amount,
      currency: 'ZAR',
      status: this.mapStripeStatus(paymentIntent.status),
    };
  }

  // Confirm cash collection (called by driver)
  async confirmCashCollection(
    tripId: string,
    driverId: string,
    amount: number
  ): Promise<{ success: boolean }> {
    const tripDoc = await collections.trips.doc(tripId).get();
    const trip = tripDoc.data();

    if (!trip || trip.driverId !== driverId) {
      throw new Error('Unauthorized');
    }

    // Update payment status
    await collections.trips.doc(tripId).update({
      'payment.status': 'completed',
      'payment.confirmedAt': Timestamp.now(),
      'payment.confirmedBy': driverId,
      'payment.collectedAmount': amount,
    });

    // Add to driver's cash balance (to be remitted)
    await collections.drivers.doc(driverId).update({
      'cashBalance': FieldValue.increment(amount),
      'lastCashCollection': Timestamp.now(),
    });

    return { success: true };
  }

  // Process refund
  async processRefund(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<RefundResult> {
    const paymentDoc = await collections.payments.doc(paymentId).get();
    const payment = paymentDoc.data();

    if (!payment) {
      throw new Error('Payment not found');
    }

    const refundAmount = amount || payment.amount;
    const refundId = this.generatePaymentId();

    try {
      switch (payment.gateway) {
        case 'stripe':
          const refund = await stripe.refunds.create({
            payment_intent: payment.stripePaymentIntentId,
            amount: Math.round(refundAmount * 100),
            reason: reason as any || 'requested_by_customer',
          });

          await this.storeRefundRecord(refundId, paymentId, refundAmount, 'completed', refund.id);

          return {
            success: true,
            refundId,
            amount: refundAmount,
            status: 'completed',
          };

        case 'wallet':
          // Credit back to wallet
          await collections.wallets.doc(payment.userId).update({
            balance: FieldValue.increment(refundAmount),
            'transactions': FieldValue.arrayUnion({
              id: refundId,
              type: 'refund',
              amount: refundAmount,
              description: `Refund for ${payment.transactionRef}`,
              reference: refundId,
              timestamp: Timestamp.now(),
            }),
          });

          await this.storeRefundRecord(refundId, paymentId, refundAmount, 'completed');

          return {
            success: true,
            refundId,
            amount: refundAmount,
            status: 'completed',
          };

        default:
          // For other gateways, mark as pending manual processing
          await this.storeRefundRecord(refundId, paymentId, refundAmount, 'pending');

          return {
            success: true,
            refundId,
            amount: refundAmount,
            status: 'pending',
          };
      }
    } catch (error: any) {
      await this.storeRefundRecord(refundId, paymentId, refundAmount, 'failed');
      throw error;
    }
  }

  // Handle webhook from Ozow
  async handleOzowWebhook(data: any): Promise<void> {
    const { TransactionReference, Status, Amount, TransactionId } = data;

    // Verify hash
    const calculatedHash = this.calculateOzowHash(data);
    if (calculatedHash !== data.Hash) {
      throw new Error('Invalid webhook hash');
    }

    // Update payment status
    const paymentsSnapshot = await collections.payments
      .where('transactionRef', '==', TransactionReference)
      .get();

    if (!paymentsSnapshot.empty) {
      const paymentDoc = paymentsSnapshot.docs[0];
      const payment = paymentDoc.data();

      const newStatus = Status === 'Complete' ? 'completed' : 
                        Status === 'Error' ? 'failed' : 'pending';

      await paymentDoc.ref.update({
        status: newStatus,
        ozowTransactionId: TransactionId,
        updatedAt: Timestamp.now(),
      });

      // Update trip payment status
      if (payment.tripId) {
        await collections.trips.doc(payment.tripId).update({
          'payment.status': newStatus === 'completed' ? 'succeeded' : 'failed',
        });
      }

      // Send notification
      if (newStatus === 'completed' && payment.userId) {
        const userDoc = await collections.users.doc(payment.userId).get();
        const user = userDoc.data();
        if (user?.phone) {
          await whatsappService.sendPaymentReceipt(user.phone, {
            amount: Amount,
            currency: 'ZAR',
            reference: TransactionReference,
            method: 'EFT (Ozow)',
          });
        }
      }
    }
  }

  // Handle SnapScan webhook
  async handleSnapScanWebhook(data: any): Promise<void> {
    const { merchantReference, status, totalAmount, userMessage } = data;

    const paymentsSnapshot = await collections.payments
      .where('transactionRef', '==', merchantReference)
      .get();

    if (!paymentsSnapshot.empty) {
      const paymentDoc = paymentsSnapshot.docs[0];
      const payment = paymentDoc.data();

      const newStatus = status === 'completed' ? 'completed' : 
                        status === 'error' ? 'failed' : 'pending';

      await paymentDoc.ref.update({
        status: newStatus,
        snapScanMessage: userMessage,
        updatedAt: Timestamp.now(),
      });

      if (payment.tripId) {
        await collections.trips.doc(payment.tripId).update({
          'payment.status': newStatus === 'completed' ? 'succeeded' : 'failed',
        });
      }
    }
  }

  // Get saved payment methods
  async getSavedPaymentMethods(userId: string): Promise<Array<{
    id: string;
    type: 'card' | 'bank';
    last4: string;
    brand?: string;
    bankName?: string;
    isDefault: boolean;
  }>> {
    const customerId = await this.getStripeCustomerId(userId);
    if (!customerId) return [];

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data.map(pm => ({
      id: pm.id,
      type: 'card',
      last4: pm.card?.last4 || '',
      brand: pm.card?.brand,
      isDefault: false, // Would check against default payment method
    }));
  }

  // Helper methods
  private generatePaymentId(): string {
    return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getStripeCustomerId(userId: string): Promise<string | null> {
    const userDoc = await collections.users.doc(userId).get();
    return userDoc.data()?.stripeCustomerId || null;
  }

  private mapStripeStatus(status: string): 'pending' | 'processing' | 'completed' | 'failed' {
    switch (status) {
      case 'succeeded': return 'completed';
      case 'processing': return 'processing';
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return 'pending';
      default: return 'failed';
    }
  }

  private async storePaymentRecord(
    result: PaymentResult,
    userId: string,
    tripId: string
  ): Promise<void> {
    await collections.payments.doc(result.paymentId).set({
      ...result,
      userId,
      tripId,
      createdAt: Timestamp.now(),
    });
  }

  private async storeRefundRecord(
    refundId: string,
    paymentId: string,
    amount: number,
    status: string,
    gatewayRefundId?: string
  ): Promise<void> {
    await collections.refunds.doc(refundId).set({
      refundId,
      paymentId,
      amount,
      status,
      gatewayRefundId,
      createdAt: Timestamp.now(),
    });
  }

  private calculateOzowHash(data: any): string {
    const hashData = [
      data.SiteCode,
      data.TransactionId,
      data.TransactionReference,
      data.Amount,
      data.Status,
      data.Optional1 || '',
      data.Optional2 || '',
      data.Optional3 || '',
      data.Optional4 || '',
      data.Optional5 || '',
      data.CurrencyCode,
      data.IsTest,
      data.StatusMessage,
      OZOW_CONFIG.privateKey,
    ].join('');

    return crypto.createHash('sha512').update(hashData.toLowerCase()).digest('hex');
  }
}

export const paymentGatewayService = new PaymentGatewayService();
