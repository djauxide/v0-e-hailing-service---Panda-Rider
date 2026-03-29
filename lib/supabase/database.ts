import { createClient } from '@/lib/supabase/server';

export interface Trip {
  id: string;
  customer_id: string;
  driver_id: string | null;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  pickup_address: string;
  dropoff_address: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  service_type: string;
  base_fare: number;
  distance_km: number;
  duration_minutes: number;
  surge_multiplier: number;
  total_fare: number;
  payment_method: string;
  payment_status: string;
}

export async function getTripById(tripId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserTrips(userId: string, limit = 10) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .or(`customer_id.eq.${userId},driver_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function createTrip(tripData: Partial<Trip>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('trips')
    .insert([tripData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTrip(tripId: string, updates: Partial<Trip>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', tripId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
