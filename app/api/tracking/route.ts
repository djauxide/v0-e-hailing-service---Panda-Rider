import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebaseAdmin';
import { sendPushNotification } from '@/lib/fcm';

const DEMO_DRIVERS = [
  { id: 'D001', name: 'Mike Johnson', lat: -26.2041, lng: 28.0473, heading: 45, vehicle: 'Toyota Camry', rating: 4.8, score: 89 },
  { id: 'D002', name: 'Sarah Lee', lat: -26.1076, lng: 28.0567, heading: 120, vehicle: 'Honda Fit', rating: 4.9, score: 92 },
  { id: 'D003', name: 'David Chen', lat: -26.1952, lng: 28.0341, heading: 90, vehicle: 'VW Polo', rating: 4.7, score: 84 },
  { id: 'D004', name: 'Thabo Mokoena', lat: -26.2124, lng: 28.0412, heading: 200, vehicle: 'Hyundai i20', rating: 4.6, score: 82 },
  { id: 'D005', name: 'Naledi Khumalo', lat: -26.1823, lng: 28.0623, heading: 15, vehicle: 'Ford Fiesta', rating: 4.9, score: 93 },
];

function computeDriverScore(driver: any) {
  const rating = Number(driver.rating ?? 4.5);
  const onTime = Number(driver.onTimePct ?? 0.9);
  const trips = Number(driver.completedTrips ?? 20);
  const score = Math.round(rating * 15 + onTime * 35 + Math.min(trips, 200) * 0.25 + (driver.reviews || 0) * 0.25);
  return Math.min(100, Math.max(50, score));
}

async function getNearbyDrivers(lat: number, lng: number, radius: number) {
  if (firestore) {
    const snap = await firestore.collection('drivers').where('status', '==', 'online').limit(50).get();
    const drivers: any[] = [];
    snap.forEach(doc => {
      const driver = doc.data();
      const driverLat = Number(driver.lat || -26.2041);
      const driverLng = Number(driver.lng || 28.0473);
      const distance = Math.sqrt(
        Math.pow((driverLat - lat) * 111, 2) +
        Math.pow((driverLng - lng) * 111 * Math.cos(lat * Math.PI / 180), 2)
      );
      if (distance <= radius) {
        drivers.push({
          id: doc.id,
          ...driver,
          distance: Number(distance.toFixed(2)),
          score: computeDriverScore(driver),
          eta: Math.max(2, Math.round(distance * 4)),
        });
      }
    });
    return drivers.sort((a, b) => b.score - a.score).slice(0, 20);
  }

  return DEMO_DRIVERS.map(driver => ({
    ...driver,
    lat: driver.lat + (Math.random() - 0.5) * 0.01,
    lng: driver.lng + (Math.random() - 0.5) * 0.01,
    heading: (driver.heading + Math.random() * 20 - 10) % 360,
    distance: Number(
      Math.sqrt(
        Math.pow((driver.lat - lat) * 111, 2) +
        Math.pow((driver.lng - lng) * 111 * Math.cos(lat * Math.PI / 180), 2)
      ).toFixed(2)
    ),
    eta: Math.floor(Math.random() * 10) + 2,
    score: driver.score,
    status: 'online',
  })).filter(d => d.distance <= radius);
}

// GET - Fetch nearby drivers
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get('lat') || '-26.2041');
  const lng = parseFloat(searchParams.get('lng') || '28.0473');
  const radius = parseFloat(searchParams.get('radius') || '5');

  const drivers = await getNearbyDrivers(lat, lng, radius);

  return NextResponse.json({
    success: true,
    data: {
      drivers,
      totalOnline: drivers.length,
      surgeMultiplier: drivers.length > 20 ? 1.3 : 1.0,
      timestamp: new Date().toISOString(),
    },
  });
}

// POST - Update driver location and optionally assign trip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { driverId, lat, lng, heading, speed, tripId, riderToken } = body;
    if (!driverId || typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ success: false, error: 'driverId, lat, and lng are required' }, { status: 400 });
    }

    const now = new Date();
    if (firestore) {
      const driverRef = firestore.collection('drivers').doc(driverId);
      const driverSnap = await driverRef.get();
      const driverData = driverSnap.exists ? driverSnap.data() : {};

      const driveScore = computeDriverScore({ ...driverData, rating: driverData?.rating ?? 4.7, completedTrips: driverData?.completedTrips ?? 25, onTimePct: driverData?.onTimePct ?? 0.92, reviews: driverData?.reviews ?? 66 });

      await driverRef.set({
        lat,
        lng,
        heading,
        speed,
        updatedAt: now,
        tripId: tripId || null,
        status: 'online',
        score: driveScore,
        lastSeen: now,
      }, { merge: true });

      await firestore.collection('driverMovements').add({ driverId, lat, lng, heading, speed, timestamp: now });

      if (tripId && riderToken) {
        await sendPushNotification(riderToken, 'Driver update', 'Your driver is moving and on route.', { tripId: String(tripId) });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        acknowledged: true,
        driverId,
        lat,
        lng,
        heading,
        speed,
        tripId: tripId || null,
        timestamp: now.toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
}
