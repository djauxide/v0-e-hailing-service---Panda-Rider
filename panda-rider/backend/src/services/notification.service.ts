import { messaging, collections } from '../config/firebase';
import { logger } from '../utils/logger';
import { generateId } from '../utils/helpers';
import { Timestamp } from 'firebase-admin/firestore';

export class NotificationService {
  // Send push notification to user
  async sendToUser(
    userId: string,
    notification: { title: string; body: string },
    data?: Record<string, string>
  ): Promise<void> {
    try {
      // Get user's FCM token
      const userDoc = await collections.users.doc(userId).get();
      const fcmToken = userDoc.data()?.fcmToken;

      if (!fcmToken) {
        logger.warn('No FCM token for user', { userId });
        return;
      }

      // Send FCM notification
      await messaging.send({
        token: fcmToken,
        notification,
        data,
        android: {
          priority: 'high',
          notification: {
            channelId: 'panda_rider_default',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      });

      // Store notification in database
      await this.storeNotification(userId, notification.title, notification.body, data);

      logger.info('Notification sent', { userId, title: notification.title });
    } catch (error) {
      logger.error('Failed to send notification', { userId, error });
    }
  }

  // Store notification in database
  private async storeNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    await collections.notifications.add({
      id: generateId(),
      userId,
      title,
      body,
      data,
      read: false,
      createdAt: Timestamp.now(),
    });
  }

  // Send trip request to driver
  async sendTripRequest(
    driverUserId: string,
    tripId: string,
    details: { pickup: string; distance: number }
  ): Promise<void> {
    await this.sendToUser(
      driverUserId,
      {
        title: 'New Trip Request',
        body: `Pickup: ${details.pickup} (${details.distance.toFixed(1)} km away)`,
      },
      {
        type: 'trip_request',
        tripId,
        pickup: details.pickup,
        distance: details.distance.toString(),
      }
    );
  }

  // Send trip accepted notification to customer
  async sendTripAccepted(
    customerId: string,
    tripId: string,
    driver: { driverName: string; vehicleType: string; vehiclePlate: string }
  ): Promise<void> {
    await this.sendToUser(
      customerId,
      {
        title: 'Driver Found!',
        body: `${driver.driverName} is on the way in a ${driver.vehicleType} (${driver.vehiclePlate})`,
      },
      {
        type: 'trip_accepted',
        tripId,
        ...driver,
      }
    );
  }

  // Send driver arriving notification
  async sendDriverArriving(customerId: string, tripId: string): Promise<void> {
    await this.sendToUser(
      customerId,
      {
        title: 'Driver is Arriving',
        body: 'Your driver is on the way to your pickup location',
      },
      {
        type: 'driver_arriving',
        tripId,
      }
    );
  }

  // Send driver arrived notification
  async sendDriverArrived(customerId: string, tripId: string): Promise<void> {
    await this.sendToUser(
      customerId,
      {
        title: 'Driver Has Arrived',
        body: 'Your driver is waiting at the pickup location',
      },
      {
        type: 'driver_arrived',
        tripId,
      }
    );
  }

  // Send trip started notification
  async sendTripStarted(customerId: string, tripId: string): Promise<void> {
    await this.sendToUser(
      customerId,
      {
        title: 'Trip Started',
        body: "You're on your way to your destination",
      },
      {
        type: 'trip_started',
        tripId,
      }
    );
  }

  // Send trip completed notification
  async sendTripCompleted(
    customerId: string,
    tripId: string,
    fare: { fare: number; currency: string }
  ): Promise<void> {
    await this.sendToUser(
      customerId,
      {
        title: 'Trip Completed',
        body: `Total fare: ${fare.currency} ${fare.fare.toFixed(2)}. Rate your trip!`,
      },
      {
        type: 'trip_completed',
        tripId,
        fare: fare.fare.toString(),
        currency: fare.currency,
      }
    );
  }

  // Send trip cancelled notification
  async sendTripCancelled(
    userId: string,
    tripId: string,
    reason: string
  ): Promise<void> {
    await this.sendToUser(
      userId,
      {
        title: 'Trip Cancelled',
        body: reason,
      },
      {
        type: 'trip_cancelled',
        tripId,
        reason,
      }
    );
  }

  // Send chat message notification
  async sendChatMessage(
    recipientId: string,
    tripId: string,
    senderName: string,
    message: string
  ): Promise<void> {
    await this.sendToUser(
      recipientId,
      {
        title: `Message from ${senderName}`,
        body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      },
      {
        type: 'chat_message',
        tripId,
        senderName,
      }
    );
  }

  // Send driver approval notification
  async sendDriverApproved(driverUserId: string): Promise<void> {
    await this.sendToUser(
      driverUserId,
      {
        title: 'Application Approved!',
        body: 'Congratulations! You can now start accepting trips.',
      },
      {
        type: 'driver_approved',
      }
    );
  }

  // Send driver rejection notification
  async sendDriverRejected(driverUserId: string, reason: string): Promise<void> {
    await this.sendToUser(
      driverUserId,
      {
        title: 'Application Status Update',
        body: `Your application needs attention: ${reason}`,
      },
      {
        type: 'driver_rejected',
        reason,
      }
    );
  }

  // Get user notifications
  async getUserNotifications(
    userId: string,
    options?: { page?: number; limit?: number; unreadOnly?: boolean }
  ): Promise<{ notifications: any[]; unreadCount: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    let query = collections.notifications
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc');

    if (options?.unreadOnly) {
      query = query.where('read', '==', false);
    }

    const snapshot = await query.get();

    // Get unread count
    const unreadSnapshot = await collections.notifications
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();

    const notifications = snapshot.docs
      .slice(offset, offset + limit)
      .map((doc) => ({ id: doc.id, ...doc.data() }));

    return {
      notifications,
      unreadCount: unreadSnapshot.size,
    };
  }

  // Mark notification as read
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const notificationRef = collections.notifications.doc(notificationId);
    const notificationDoc = await notificationRef.get();

    if (notificationDoc.exists && notificationDoc.data()?.userId === userId) {
      await notificationRef.update({ read: true });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    const snapshot = await collections.notifications
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();

    const batch = collections.notifications.firestore.batch();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
  }
}

export const notificationService = new NotificationService();
