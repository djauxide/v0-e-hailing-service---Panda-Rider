import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    let query = supabase
      .from('trips')
      .select('*')
      .or(`customer_id.eq.${user.id},driver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: trips, error } = await query;

    if (error) throw error;

    return NextResponse.json(trips);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      pickup_lat,
      pickup_lng,
      dropoff_lat,
      dropoff_lng,
      pickup_address,
      dropoff_address,
      service_type = 'ride',
      payment_method = 'wallet',
    } = body;

    // Validate required fields
    if (!pickup_lat || !pickup_lng || !dropoff_lat || !dropoff_lng) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create trip
    const { data: trip, error } = await supabase
      .from('trips')
      .insert([{
        customer_id: user.id,
        pickup_lat,
        pickup_lng,
        dropoff_lat,
        dropoff_lng,
        pickup_address,
        dropoff_address,
        service_type,
        payment_method,
        status: 'pending',
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(trip, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
