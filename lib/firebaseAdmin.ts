import admin from 'firebase-admin';

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    // Attempt default app credentials (for deployed environments)
    try {
      admin.initializeApp();
    } catch (error) {
      // fallback remains uninitialized
    }
  }
}

export const firestore = admin.apps.length ? admin.firestore() : null;
