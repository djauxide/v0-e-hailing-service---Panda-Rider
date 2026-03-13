import { Router, Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service';

const router = Router();

// WhatsApp Webhook verification
router.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'panda_rider_verify_token';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp webhook verified');
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

// WhatsApp Webhook for incoming messages
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    await whatsappService.handleWebhook(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.sendStatus(500);
  }
});

// Send test message (admin only)
router.post('/send-test', async (req: Request, res: Response) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ success: false, error: 'Phone and message required' });
    }

    const success = await whatsappService.sendTextMessage(phone, message);

    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
