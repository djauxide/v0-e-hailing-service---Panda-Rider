import { collections, db } from '../config/firebase';
import { ChatMessage, Trip } from '../models/types';
import { ApiError, ErrorCodes } from '../utils/errors';
import { generateId } from '../utils/helpers';
import { Timestamp } from 'firebase-admin/firestore';
import { notificationService } from './notification.service';

export class ChatService {
  // Send a message
  async sendMessage(
    userId: string,
    tripId: string,
    text: string,
    type: 'text' | 'image' | 'location' = 'text'
  ): Promise<ChatMessage> {
    // Get trip to verify user is part of it
    const tripDoc = await collections.trips.doc(tripId).get();

    if (!tripDoc.exists) {
      throw ApiError.notFound('Trip not found', ErrorCodes.TRIP_NOT_FOUND);
    }

    const trip = tripDoc.data() as Trip;

    // Check if user is customer or driver of this trip
    let senderType: 'customer' | 'driver';
    let recipientId: string;

    if (userId === trip.customerId) {
      senderType = 'customer';
      recipientId = trip.driverId!;
    } else if (userId === trip.driverId) {
      senderType = 'driver';
      recipientId = trip.customerId;
    } else {
      throw ApiError.forbidden('Not authorized to send messages in this chat');
    }

    // Only allow chat during active trips
    const activeStatuses = ['accepted', 'arriving', 'arrived', 'in_progress'];
    if (!activeStatuses.includes(trip.status)) {
      throw ApiError.badRequest('Chat is only available during active trips');
    }

    const messageId = generateId();

    const messageData: Omit<ChatMessage, 'id'> = {
      tripId,
      senderId: userId,
      senderType,
      text,
      type,
      read: false,
      createdAt: Timestamp.now(),
    };

    // Store message in subcollection
    await db
      .collection('chats')
      .doc(tripId)
      .collection('messages')
      .doc(messageId)
      .set(messageData);

    // Update last message in chat document
    await db.collection('chats').doc(tripId).set(
      {
        tripId,
        lastMessage: {
          text,
          senderId: userId,
          createdAt: Timestamp.now(),
        },
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    // Send notification to recipient
    await notificationService.sendChatMessage(
      recipientId,
      tripId,
      senderType === 'customer' ? 'Customer' : 'Driver',
      text
    );

    return { ...messageData, id: messageId };
  }

  // Get messages for a trip
  async getMessages(
    userId: string,
    tripId: string,
    options?: { limit?: number; before?: string }
  ): Promise<ChatMessage[]> {
    // Verify user is part of the trip
    const tripDoc = await collections.trips.doc(tripId).get();

    if (!tripDoc.exists) {
      throw ApiError.notFound('Trip not found', ErrorCodes.TRIP_NOT_FOUND);
    }

    const trip = tripDoc.data() as Trip;

    if (userId !== trip.customerId && userId !== trip.driverId) {
      throw ApiError.forbidden('Not authorized to view this chat');
    }

    const limit = options?.limit || 50;

    let query = db
      .collection('chats')
      .doc(tripId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (options?.before) {
      const beforeDoc = await db
        .collection('chats')
        .doc(tripId)
        .collection('messages')
        .doc(options.before)
        .get();

      if (beforeDoc.exists) {
        query = query.startAfter(beforeDoc);
      }
    }

    const snapshot = await query.get();

    const messages = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as ChatMessage[];

    // Mark messages as read
    this.markMessagesAsRead(userId, tripId, messages);

    return messages.reverse(); // Return in chronological order
  }

  // Mark messages as read
  private async markMessagesAsRead(
    userId: string,
    tripId: string,
    messages: ChatMessage[]
  ): Promise<void> {
    const unreadMessages = messages.filter(
      (m) => !m.read && m.senderId !== userId
    );

    if (unreadMessages.length === 0) return;

    const batch = db.batch();

    for (const message of unreadMessages) {
      const messageRef = db
        .collection('chats')
        .doc(tripId)
        .collection('messages')
        .doc(message.id);

      batch.update(messageRef, { read: true });
    }

    await batch.commit();
  }

  // Get unread message count for a trip
  async getUnreadCount(userId: string, tripId: string): Promise<number> {
    const snapshot = await db
      .collection('chats')
      .doc(tripId)
      .collection('messages')
      .where('senderId', '!=', userId)
      .where('read', '==', false)
      .get();

    return snapshot.size;
  }

  // Send quick message (predefined messages)
  async sendQuickMessage(
    userId: string,
    tripId: string,
    messageKey: string
  ): Promise<ChatMessage> {
    const quickMessages: Record<string, string> = {
      on_my_way: "I'm on my way!",
      arrived: "I've arrived at the pickup location.",
      waiting: "I'm waiting for you.",
      running_late: "I'm running a few minutes late.",
      wrong_location: 'I think I might be at the wrong location.',
      call_me: 'Please call me.',
      thanks: 'Thank you!',
      driver_on_way: "I'm on my way to pick you up!",
      driver_arrived: "I've arrived. I'm waiting outside.",
      start_trip: 'Starting the trip now.',
    };

    const text = quickMessages[messageKey];

    if (!text) {
      throw ApiError.badRequest('Invalid quick message key');
    }

    return this.sendMessage(userId, tripId, text, 'text');
  }

  // Share location in chat
  async shareLocation(
    userId: string,
    tripId: string,
    location: { lat: number; lng: number; address: string }
  ): Promise<ChatMessage> {
    const text = JSON.stringify(location);
    return this.sendMessage(userId, tripId, text, 'location');
  }
}

export const chatService = new ChatService();
