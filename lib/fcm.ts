import { messaging } from '@/lib/firebaseAdmin';

export async function sendPushNotification(token: string, title: string, body: string, data?: Record<string, string>) {
  if (!messaging) return { success: false, error: 'Firebase messaging not initialized' };
  try {
    const message: any = {
      token,
      notification: { title, body },
      android: { priority: 'high' },
      apns: { headers: { 'apns-priority': '10' } },
      data: data ?? {},
    };
    const response = await messaging.send(message);
    return { success: true, response };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}
