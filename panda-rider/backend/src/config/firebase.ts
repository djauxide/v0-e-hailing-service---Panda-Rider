import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  });
};

// Initialize the app
const app = initializeFirebase();

// Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const messaging = getMessaging(app);
export const storage = getStorage(app);

// Collection references
export const collections = {
  users: db.collection('users'),
  drivers: db.collection('drivers'),
  trips: db.collection('trips'),
  orders: db.collection('orders'),
  packages: db.collection('packages'),
  payments: db.collection('payments'),
  ratings: db.collection('ratings'),
  notifications: db.collection('notifications'),
};

export default admin;
