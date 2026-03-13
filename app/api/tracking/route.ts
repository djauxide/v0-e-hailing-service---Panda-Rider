import { NextRequest, NextResponse } from 'next/server';

// Simulated real-time driver locations for demo
const DEMO_DRIVERS = [
  { id: 'D001', name: 'Mike Johnson', lat: -26.2041, lng: 28.0473, heading: 45, vehicle: 'Toyota Camry', rating: 4.8 },
  { id: 'D002', name: 'Sarah Lee', lat: -26.1076, lng: 28.0567, heading: 120, vehicle: 'Honda Fit', rating: 4.9 },
  { id: 'D003', name: 'David Chen', lat: -26.1952, lng: 28.0341, heading: 90, vehicle: 'VW Polo', rating: 4.7 },
  { id: 'D004', name: 'Thabo Mokoena', lat: -26.2124, lng: 28.0412, heading: 200, vehicle: 'Hyundai i20', rating: 4.6 },
  { id: 'D005', name: 'Naledi Khumalo', lat: -26.1823, lng: 28.0623, heading: 15, vehicle: 'Ford Fiesta', rating: 4.9 },
];

// GET - Fetch nearby drivers
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get('lat') || '-26.2041');
  const lng = parseFloat(searchParams.get('lng') || '28.0473');
  const radius = parseFloat(searchParams.get('radius') || '5');

  // Add some random movement to simulate real-time updates
  const drivers = DEMO_DRIVERS.map(driver => ({
    ...driver,
    lat: driver.lat + (Math.random() - 0.5) * 0.01,
    lng: driver.lng + (Math.random() - 0.5) * 0.01,
    heading: (driver.heading + Math.random() * 20 - 10) % 360,
    distance: Math.sqrt(
      Math.pow((driver.lat - lat) * 111, 2) + 
      Math.pow((driver.lng - lng) * 111 * Math.cos(lat * Math.PI / 180), 2)
    ).toFixed(2),
    eta: Math.floor(Math.random() * 10) + 2,
  }));

  // Filter by radius
  const nearbyDrivers = drivers.filter(d => parseFloat(d.distance) <= radius);

  return NextResponse.json({
    success: true,
    data: {
      drivers: nearbyDrivers,
      totalOnline: drivers.length,
      surgeMultiplier: 1.0,
      timestamp: new Date().toISOString(),
    },
  });
}

// POST - Update driver location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { driverId, lat, lng, heading, speed, tripId } = body;

    // In production, this would update Firestore and trigger real-time updates
    // For demo, we just acknowledge the update

    return NextResponse.json({
      success: true,
      data: {
        acknowledged: true,
        driverId,
        location: { lat, lng, heading, speed },
        tripId,
        eta: tripId ? {
          distanceRemaining: 2.4,
          durationRemaining: 8,
          status: 'on_track',
        } : null,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
