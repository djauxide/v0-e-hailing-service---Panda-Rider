import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebaseAdmin';

function computeDriverScore(driver: any) {
  const rating = Number(driver.rating ?? 4.6);
  const onTime = Number(driver.onTimePct ?? 0.9);
  const trips = Number(driver.completedTrips ?? 20);
  return Math.min(100, Math.round(rating * 15 + onTime * 35 + Math.log10(Math.max(1, trips)) * 20));
}

export async function GET() {
  if (!firestore) {
    return NextResponse.json({ success: false, error: 'Firestore not initialized' }, { status: 500 });
  }
  const snap = await firestore.collection('drivers').orderBy('score', 'desc').limit(50).get();
  const drivers: any[] = [];
  snap.forEach(doc => drivers.push({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ success: true, data: { drivers, timestamp: new Date().toISOString() } });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { driverId, action, verificationCode, score, appToken } = body as { driverId?: string; action?: string; verificationCode?: string; score?: number; appToken?: string };

    if (!firestore) {
      return NextResponse.json({ success: false, error: 'Firestore not initialized' }, { status: 500 });
    }

    if (!driverId) {
      return NextResponse.json({ success: false, error: 'driverId is required' }, { status: 400 });
    }

    const ref = firestore.collection('drivers').doc(driverId);
    const current = (await ref.get()).data() || {};

    if (action === 'verify') {
      const verified = verificationCode === 'PANDA123';
      const nextData = {
        verification: {
          verified,
          verifiedAt: verified ? new Date() : null,
          method: 'otp',
          code: verificationCode,
        },
        status: verified ? 'online' : 'verification_failed',
      };
      await ref.set(nextData, { merge: true });
      return NextResponse.json({ success: true, data: { ...nextData, driverId } });
    }

    if (action === 'score') {
      const newScore = Number(score ?? computeDriverScore(current));
      await ref.set({ score: newScore, updatedAt: new Date() }, { merge: true });
      return NextResponse.json({ success: true, data: { driverId, score: newScore } });
    }

    if (action === 'assign') {
      const assigned = `trip-${Date.now()}`;
      await ref.set({ tripId: assigned, status: 'assigned', assignedAt: new Date() }, { merge: true });
      return NextResponse.json({ success: true, data: { driverId, assignedTrip: assigned } });
    }

    return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
