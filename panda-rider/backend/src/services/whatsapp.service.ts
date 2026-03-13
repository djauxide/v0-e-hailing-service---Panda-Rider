import { db } from '../config/firebase';
import { logger } from '../utils/logger';

// WhatsApp Business API Configuration
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'interactive';
  text?: { body: string };
  template?: {
    name: string;
    language: { code: string };
    components?: Array<{
      type: string;
      parameters: Array<{ type: string; text?: string }>;
    }>;
  };
  interactive?: {
    type: string;
    body: { text: string };
    action: {
      buttons?: Array<{ type: string; reply: { id: string; title: string } }>;
    };
  };
}

export class WhatsAppService {
  private baseUrl: string;
  private phoneNumberId: string;
  private accessToken: string;

  constructor() {
    this.baseUrl = WHATSAPP_API_URL;
    this.phoneNumberId = WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = WHATSAPP_ACCESS_TOKEN;
  }

  // Send a text message
  async sendTextMessage(to: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: this.formatPhoneNumber(to),
            type: 'text',
            text: { body: message },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      await this.logMessage(to, 'text', message);
      return true;
    } catch (error) {
      logger.error('WhatsApp send message error:', error);
      return false;
    }
  }

  // Send trip booking confirmation
  async sendTripConfirmation(
    to: string,
    tripId: string,
    driverName: string,
    vehicleDetails: string,
    eta: string,
    fare: number
  ): Promise<boolean> {
    const message = `Panda Rider - Trip Confirmed!

Trip ID: ${tripId}
Driver: ${driverName}
Vehicle: ${vehicleDetails}
ETA: ${eta}
Estimated Fare: R${fare.toFixed(2)}

Track your trip in the Panda Rider app.
Need help? Reply HELP`;

    return this.sendTextMessage(to, message);
  }

  // Send driver arrival notification
  async sendDriverArrival(to: string, driverName: string, vehicleDetails: string): Promise<boolean> {
    const message = `Your Panda is here!

${driverName} has arrived in ${vehicleDetails}.

Please proceed to pickup point. The driver will wait for 5 minutes.`;

    return this.sendTextMessage(to, message);
  }

  // Send trip completion with payment details
  async sendTripComplete(
    to: string,
    tripId: string,
    fare: number,
    distance: number,
    duration: number
  ): Promise<boolean> {
    const message = `Trip Completed - Thank you!

Trip ID: ${tripId}
Distance: ${distance.toFixed(1)} km
Duration: ${duration} mins
Total Fare: R${fare.toFixed(2)}

Rate your trip in the app. Thank you for riding with Panda Rider!`;

    return this.sendTextMessage(to, message);
  }

  // Send money transfer notification
  async sendMoneyTransferNotification(
    to: string,
    amount: number,
    senderName: string,
    reference: string,
    type: 'sent' | 'received'
  ): Promise<boolean> {
    const message = type === 'received'
      ? `You've received R${amount.toFixed(2)}!

From: ${senderName}
Reference: ${reference}

Your new Panda Wallet balance is available in the app.`
      : `Money Sent Successfully

Amount: R${amount.toFixed(2)}
To: ${senderName}
Reference: ${reference}

Transaction complete. Check your wallet for details.`;

    return this.sendTextMessage(to, message);
  }

  // Send wallet top-up confirmation
  async sendWalletTopUp(to: string, amount: number, newBalance: number): Promise<boolean> {
    const message = `Wallet Top-Up Successful!

Amount Added: R${amount.toFixed(2)}
New Balance: R${newBalance.toFixed(2)}

Your Panda Wallet is ready to use.`;

    return this.sendTextMessage(to, message);
  }

  // Send payment receipt
  async sendPaymentReceipt(
    to: string,
    transactionId: string,
    amount: number,
    description: string
  ): Promise<boolean> {
    const message = `Payment Receipt

Transaction: ${transactionId}
Amount: R${amount.toFixed(2)}
Description: ${description}
Date: ${new Date().toLocaleString('en-ZA')}

Thank you for using Panda Rider!`;

    return this.sendTextMessage(to, message);
  }

  // Send OTP for verification
  async sendOTP(to: string, otp: string): Promise<boolean> {
    const message = `Your Panda Rider verification code is: ${otp}

This code expires in 5 minutes. Do not share this code with anyone.`;

    return this.sendTextMessage(to, message);
  }

  // Send promotional message
  async sendPromotion(to: string, promoCode: string, discount: number, expiryDate: string): Promise<boolean> {
    const message = `Special Offer from Panda Rider!

Use code ${promoCode} to get ${discount}% off your next ride.

Valid until: ${expiryDate}

Book now in the Panda Rider app!`;

    return this.sendTextMessage(to, message);
  }

  // Send interactive message with buttons
  async sendInteractiveMessage(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: this.formatPhoneNumber(to),
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: bodyText },
              action: {
                buttons: buttons.slice(0, 3).map(btn => ({
                  type: 'reply',
                  reply: { id: btn.id, title: btn.title.slice(0, 20) },
                })),
              },
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      logger.error('WhatsApp interactive message error:', error);
      return false;
    }
  }

  // Handle incoming webhook
  async handleWebhook(body: any): Promise<void> {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (messages && messages.length > 0) {
        const message = messages[0];
        const from = message.from;
        const text = message.text?.body?.toLowerCase();

        // Handle commands
        if (text === 'help') {
          await this.sendTextMessage(from, `Panda Rider Help

Commands:
BALANCE - Check wallet balance
HISTORY - Recent transactions
SUPPORT - Contact support
BOOK - Book a ride

Reply with a command to continue.`);
        } else if (text === 'balance') {
          // Fetch and send balance
          const balance = await this.getWalletBalance(from);
          await this.sendTextMessage(from, `Your Panda Wallet balance is R${balance.toFixed(2)}`);
        } else if (text === 'support') {
          await this.sendTextMessage(from, `Panda Rider Support

Call: 0800 PANDA (72632)
Email: support@pandarider.co.za
Hours: 24/7

We're here to help!`);
        }
      }
    } catch (error) {
      logger.error('Webhook handling error:', error);
    }
  }

  // Helper: Format phone number to international format
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle South African numbers
    if (cleaned.startsWith('0')) {
      cleaned = '27' + cleaned.slice(1);
    } else if (!cleaned.startsWith('27') && cleaned.length === 9) {
      cleaned = '27' + cleaned;
    }
    
    return cleaned;
  }

  // Helper: Get wallet balance
  private async getWalletBalance(phone: string): Promise<number> {
    try {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('phone', '==', phone).limit(1).get();
      
      if (snapshot.empty) return 0;
      
      const user = snapshot.docs[0].data();
      return user.walletBalance || 0;
    } catch {
      return 0;
    }
  }

  // Helper: Log message to database
  private async logMessage(to: string, type: string, content: string): Promise<void> {
    try {
      await db.collection('whatsapp_messages').add({
        to,
        type,
        content,
        sentAt: new Date(),
        status: 'sent',
      });
    } catch (error) {
      logger.error('Message logging error:', error);
    }
  }
}

export const whatsappService = new WhatsAppService();
