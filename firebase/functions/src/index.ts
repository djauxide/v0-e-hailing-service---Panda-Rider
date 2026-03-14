import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// Trigger driver score recomputation whenever a driver document changes.
exports.onDriverUpdate = functions.firestore.document('drivers/{driverId}').onWrite(async (change, context) => {
  const driverId = context.params.driverId;
  const newValue = change.after.exists ? change.after.data() : null;
  if (!newValue) return null;

  const rating = Number(newValue.rating ?? 4.7);
  const onTime = Number(newValue.onTimePct ?? 0.9);
  const trips = Number(newValue.completedTrips ?? 20);
  const score = Math.min(100, Math.round(rating * 15 + onTime * 35 + Math.log10(Math.max(1, trips)) * 20));

  await db.collection('drivers').doc(driverId).set({ score, lastScoredAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  return null;
});

// Assign next top driver for unassigned ride requests.
exports.assignDriversToRide = functions.firestore.document('rides/{rideId}').onCreate(async (snap, context) => {
  const ride = snap.data();
  if (!ride) return null;
  const nearbyDrivers = await db.collection('drivers').where('status', '==', 'online').orderBy('score', 'desc').limit(1).get();
  const best = nearbyDrivers.docs[0];
  if (!best) {
    await snap.ref.update({ status: 'pending', assignedDriver: null });
    return null;
  }

  const assignment = { assignedDriver: best.id, assignedAt: admin.firestore.FieldValue.serverTimestamp(), status: 'assigned' };
  await snap.ref.update(assignment);
  await db.collection('drivers').doc(best.id).set({ tripId: context.params.rideId, status: 'assigned' }, { merge: true });
  return null;
});

// Push notifications for new assignment by writing to `notifications` collection.
exports.notifyDriverAssignment = functions.firestore.document('rides/{rideId}').onUpdate(async (change, context) => {
  const before = change.before.data();
  const after = change.after.data();
  if (!after || after.assignedDriver === before?.assignedDriver) return null;

  const driver = await db.collection('drivers').doc(after.assignedDriver).get();
  const driverData = driver.data() || {};
  const token = driverData.fcmToken;
  if (token) {
    await admin.messaging().send({
      token,
      notification: {
        title: 'New ride assigned',
        body: `Ride ${context.params.rideId} is now assigned to you`,
      },
      data: { rideId: context.params.rideId },
    });
  }

  const rider = await db.collection('riders').doc(after.riderId).get();
  const riderData = rider.data() || {};
  if (riderData?.fcmToken) {
    await admin.messaging().send({
      token: riderData.fcmToken,
      notification: {
        title: 'Driver assigned',
        body: `Your driver ${driverData.name ?? 'driver'} is on the way`,
      },
      data: { rideId: context.params.rideId },
    });
  }

  return null;
});

// Track driver movement and update ride location records
exports.onDriverMovement = functions.firestore.document('driverMovements/{movementId}').onCreate(async (snap, context) => {
  const movement = snap.data();
  if (!movement || !movement.driverId) return null;

  const driver = await db.collection('drivers').doc(movement.driverId).get();
  const driverData = driver.data() || {};
  if (driverData.tripId) {
    await db.collection('rides').doc(driverData.tripId).set({
      driverLocation: {
        lat: movement.lat,
        lng: movement.lng,
        heading: movement.heading,
        speed: movement.speed,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      status: 'driver_en_route',
    }, { merge: true });
  }
  return null;
});
