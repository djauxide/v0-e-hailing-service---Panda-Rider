#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓ Set' : '✗ Missing');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓ Set' : '✗ Missing');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const schema = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('customer', 'driver', 'admin');
CREATE TYPE trip_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('card', 'wallet', 'cash', 'eft', 'google_pay', 'apple_pay');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  first_name TEXT,
  last_name TEXT,
  phone TEXT UNIQUE,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  date_of_birth DATE,
  id_number TEXT,
  country TEXT DEFAULT 'ZA',
  city TEXT,
  address TEXT,
  rating DECIMAL(3, 2) DEFAULT 5.00,
  total_trips INT DEFAULT 0,
  total_ratings INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  biometric_enabled BOOLEAN DEFAULT FALSE,
  pin_hash TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  license_number TEXT UNIQUE,
  license_expiry DATE,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INT,
  vehicle_registration TEXT UNIQUE,
  vehicle_color TEXT,
  insurance_provider TEXT,
  insurance_expiry DATE,
  status TEXT DEFAULT 'offline',
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  current_trip_id UUID,
  total_earnings DECIMAL(12, 2) DEFAULT 0,
  acceptance_rate DECIMAL(5, 2) DEFAULT 100,
  cancellation_rate DECIMAL(5, 2) DEFAULT 0,
  documents_verified BOOLEAN DEFAULT FALSE,
  background_check_passed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pickup_lat DECIMAL(10, 8) NOT NULL,
  pickup_lng DECIMAL(11, 8) NOT NULL,
  dropoff_lat DECIMAL(10, 8) NOT NULL,
  dropoff_lng DECIMAL(11, 8) NOT NULL,
  pickup_address TEXT,
  dropoff_address TEXT,
  status trip_status DEFAULT 'pending',
  service_type TEXT DEFAULT 'ride',
  base_fare DECIMAL(10, 2),
  distance_km DECIMAL(8, 2),
  duration_minutes INT,
  surge_multiplier DECIMAL(4, 2) DEFAULT 1.0,
  total_fare DECIMAL(10, 2),
  payment_method payment_method DEFAULT 'wallet',
  payment_status payment_status DEFAULT 'pending',
  notes TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_by TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Panda Pay Wallet
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(12, 2) DEFAULT 0,
  pending_balance DECIMAL(12, 2) DEFAULT 0,
  total_earned DECIMAL(14, 2) DEFAULT 0,
  total_spent DECIMAL(14, 2) DEFAULT 0,
  currency TEXT DEFAULT 'ZAR',
  last_topup TIMESTAMP,
  last_withdrawal TIMESTAMP,
  auto_payout_enabled BOOLEAN DEFAULT TRUE,
  min_payout_amount DECIMAL(10, 2) DEFAULT 500,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  description TEXT,
  reference_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  method payment_method NOT NULL,
  status payment_status DEFAULT 'pending',
  gateway_transaction_id TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ratings
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ratee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Surge Zones
CREATE TABLE IF NOT EXISTS public.surge_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  geohash TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  multiplier DECIMAL(4, 2) DEFAULT 1.0,
  demand_ratio DECIMAL(5, 2),
  active_drivers INT,
  pending_requests INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surge_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for Drivers
CREATE POLICY "Drivers can view their own profile" ON public.drivers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Drivers can update their own profile" ON public.drivers FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Trips
CREATE POLICY "Users can view their trips" ON public.trips FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = driver_id);
CREATE POLICY "Users can insert trips" ON public.trips FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- RLS Policies for Wallets
CREATE POLICY "Users can view their wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their wallet" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Transactions
CREATE POLICY "Users can view their transactions" ON public.transactions FOR SELECT USING (
  auth.uid() = (SELECT user_id FROM public.wallets WHERE id = wallet_id)
);

-- RLS Policies for Payments
CREATE POLICY "Users can view their payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_profiles_phone ON public.profiles(phone);
CREATE INDEX idx_drivers_status ON public.drivers(status);
CREATE INDEX idx_trips_customer_id ON public.trips(customer_id);
CREATE INDEX idx_trips_driver_id ON public.trips(driver_id);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_surge_zones_geohash ON public.surge_zones(geohash);
`;

async function initializeDatabase() {
  console.log('🚀 Initializing Panda Rider Supabase Database...\n');

  try {
    const { error } = await supabase.rpc('exec', { sql: schema });

    if (error) {
      console.error('❌ Error executing schema:', error);
      process.exit(1);
    }

    console.log('✅ Database schema created successfully!');
    console.log('\n📊 Tables created:');
    console.log('   ✓ profiles');
    console.log('   ✓ drivers');
    console.log('   ✓ trips');
    console.log('   ✓ wallets (Panda Pay)');
    console.log('   ✓ transactions');
    console.log('   ✓ payments');
    console.log('   ✓ ratings');
    console.log('   ✓ surge_zones');
    console.log('   ✓ notifications');
    console.log('\n🔒 Row Level Security enabled on all tables');
    console.log('📈 Indexes created for optimal performance\n');
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

initializeDatabase();
