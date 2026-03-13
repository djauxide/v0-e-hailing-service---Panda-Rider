import { stripe, STRIPE_CURRENCY } from '../config/stripe';
import { collections } from '../config/firebase';
import { Payment, PaymentStatus } from '../models/types';
import { ApiError, ErrorCodes } from '../utils/errors';
import { generateId } from '../utils/helpers';
import { Timestamp } from 'firebase-admin/firestore';

export class PaymentService {
  // Create a payment intent for a trip (ZAR - South African Rand)
  async createPaymentIntent(
    userId: string,
    tripId: string,
    amount: number,
    currency: string = STRIPE_CURRENCY // Default to ZAR
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    // Get user's Stripe customer ID
    const userDoc = await collections.users.doc(userId).get();

    if (!userDoc.exists) {
      throw ApiError.notFound('User not found', ErrorCodes.USER_NOT_FOUND);
    }

    const userData = userDoc.data();
    const stripeCustomerId = userData?.stripeCustomerId;

    if (!stripeCustomerId) {
      throw ApiError.badRequest('No payment methods configured', ErrorCodes.INVALID_PAYMENT_METHOD);
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: stripeCustomerId,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      metadata: {
        tripId,
        userId,
      },
    });

    // Store payment record
    const paymentId = generateId();
    await collections.payments.doc(paymentId).set({
      tripId,
      userId,
      amount,
      currency: currency.toUpperCase(),
      method: 'card',
      status: 'pending',
      stripePaymentIntentId: paymentIntent.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Update trip with payment intent ID
    await collections.trips.doc(tripId).update({
      'payment.paymentIntentId': paymentIntent.id,
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }

  // Confirm a payment
  async confirmPayment(paymentIntentId: string): Promise<Payment> {
    // Get payment record
    const paymentSnapshot = await collections.payments
      .where('stripePaymentIntentId', '==', paymentIntentId)
      .limit(1)
      .get();

    if (paymentSnapshot.empty) {
      throw ApiError.notFound('Payment not found', ErrorCodes.PAYMENT_NOT_FOUND);
    }

    const paymentDoc = paymentSnapshot.docs[0];
    const payment = paymentDoc.data() as Payment;

    // Confirm with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    let status: PaymentStatus;
    switch (paymentIntent.status) {
      case 'succeeded':
        status = 'succeeded';
        break;
      case 'processing':
        status = 'processing';
        break;
      case 'canceled':
      case 'requires_payment_method':
        status = 'failed';
        break;
      default:
        status = 'pending';
    }

    // Update payment record
    await paymentDoc.ref.update({
      status,
      stripeChargeId: paymentIntent.latest_charge as string,
      updatedAt: Timestamp.now(),
    });

    return { ...payment, id: paymentDoc.id, status };
  }

  // Get user's payment methods
  async getPaymentMethods(userId: string): Promise<any[]> {
    const userDoc = await collections.users.doc(userId).get();

    if (!userDoc.exists) {
      throw ApiError.notFound('User not found', ErrorCodes.USER_NOT_FOUND);
    }

    const userData = userDoc.data();
    const stripeCustomerId = userData?.stripeCustomerId;

    if (!stripeCustomerId) {
      return [];
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });

    return paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
      isDefault: pm.id === userData?.defaultPaymentMethodId,
    }));
  }

  // Add a payment method
  async addPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    const userDoc = await collections.users.doc(userId).get();

    if (!userDoc.exists) {
      throw ApiError.notFound('User not found', ErrorCodes.USER_NOT_FOUND);
    }

    const userData = userDoc.data();
    const stripeCustomerId = userData?.stripeCustomerId;

    if (!stripeCustomerId) {
      throw ApiError.badRequest('User not set up for payments');
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // Set as default if first payment method
    const existingMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });

    if (existingMethods.data.length === 1) {
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      await collections.users.doc(userId).update({
        defaultPaymentMethodId: paymentMethodId,
        updatedAt: Timestamp.now(),
      });
    }
  }

  // Remove a payment method
  async removePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    const userDoc = await collections.users.doc(userId).get();

    if (!userDoc.exists) {
      throw ApiError.notFound('User not found', ErrorCodes.USER_NOT_FOUND);
    }

    // Detach payment method
    await stripe.paymentMethods.detach(paymentMethodId);

    // Update default if this was the default
    const userData = userDoc.data();
    if (userData?.defaultPaymentMethodId === paymentMethodId) {
      await collections.users.doc(userId).update({
        defaultPaymentMethodId: null,
        updatedAt: Timestamp.now(),
      });
    }
  }

  // Set default payment method
  async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    const userDoc = await collections.users.doc(userId).get();

    if (!userDoc.exists) {
      throw ApiError.notFound('User not found', ErrorCodes.USER_NOT_FOUND);
    }

    const userData = userDoc.data();
    const stripeCustomerId = userData?.stripeCustomerId;

    if (!stripeCustomerId) {
      throw ApiError.badRequest('User not set up for payments');
    }

    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    await collections.users.doc(userId).update({
      defaultPaymentMethodId: paymentMethodId,
      updatedAt: Timestamp.now(),
    });
  }

  // Process refund
  async refund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<{ refundId: string; amount: number }> {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw ApiError.badRequest('Cannot refund this payment');
    }

    const refundParams: any = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundParams.amount = Math.round(amount * 100);
    }

    if (reason) {
      refundParams.reason = 'requested_by_customer';
      refundParams.metadata = { reason };
    }

    const refund = await stripe.refunds.create(refundParams);

    // Update payment record
    const paymentSnapshot = await collections.payments
      .where('stripePaymentIntentId', '==', paymentIntentId)
      .limit(1)
      .get();

    if (!paymentSnapshot.empty) {
      await paymentSnapshot.docs[0].ref.update({
        status: 'refunded',
        refundId: refund.id,
        refundAmount: refund.amount / 100,
        updatedAt: Timestamp.now(),
      });
    }

    return {
      refundId: refund.id,
      amount: refund.amount / 100,
    };
  }

  // Handle Stripe webhook
  async handleWebhook(event: any): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object);
        break;

      case 'charge.refunded':
        await this.handleRefund(event.data.object);
        break;
    }
  }

  private async handlePaymentSuccess(paymentIntent: any): Promise<void> {
    const { tripId } = paymentIntent.metadata;

    if (tripId) {
      await collections.trips.doc(tripId).update({
        'payment.status': 'succeeded',
        'payment.paidAt': Timestamp.now(),
      });
    }

    // Update payment record
    const paymentSnapshot = await collections.payments
      .where('stripePaymentIntentId', '==', paymentIntent.id)
      .limit(1)
      .get();

    if (!paymentSnapshot.empty) {
      await paymentSnapshot.docs[0].ref.update({
        status: 'succeeded',
        updatedAt: Timestamp.now(),
      });
    }
  }

  private async handlePaymentFailure(paymentIntent: any): Promise<void> {
    const { tripId } = paymentIntent.metadata;

    if (tripId) {
      await collections.trips.doc(tripId).update({
        'payment.status': 'failed',
      });
    }

    // Update payment record
    const paymentSnapshot = await collections.payments
      .where('stripePaymentIntentId', '==', paymentIntent.id)
      .limit(1)
      .get();

    if (!paymentSnapshot.empty) {
      await paymentSnapshot.docs[0].ref.update({
        status: 'failed',
        updatedAt: Timestamp.now(),
      });
    }
  }

  private async handleRefund(charge: any): Promise<void> {
    const paymentSnapshot = await collections.payments
      .where('stripeChargeId', '==', charge.id)
      .limit(1)
      .get();

    if (!paymentSnapshot.empty) {
      await paymentSnapshot.docs[0].ref.update({
        status: 'refunded',
        updatedAt: Timestamp.now(),
      });
    }
  }
}

export const paymentService = new PaymentService();
