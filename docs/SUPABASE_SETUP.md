# Supabase SQL Integration Setup

## Overview
Panda Rider is now fully integrated with Supabase PostgreSQL database. All data (profiles, drivers, trips, wallets, payments, ratings) is persisted in Supabase with Row Level Security (RLS) for data protection.

## Quick Start

### 1. Environment Variables
Your Supabase credentials are already configured:
```env
NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### 2. Initialize Database Schema
Run the initialization script to create all tables:

```bash
# Install dependencies
npm install

# Run Supabase initialization
node scripts/init-supabase.js
```

This creates:
- **profiles** - User account information
- **drivers** - Driver-specific data (license, vehicle, status)
- **trips** - Trip records (pickup, dropoff, status, fare)
- **wallets** - Panda Pay wallet accounts (balance, pending, earnings)
- **transactions** - Wallet transaction history
- **payments** - Payment records for trips
- **ratings** - Trip ratings and reviews
- **surge_zones** - Dynamic surge pricing zones
- **notifications** - User notifications

## Architecture

### Database Structure
```
Profiles (Customer & Driver)
├── Wallets (Panda Pay)
│   └── Transactions
├── Trips
│   ├── Payments
│   └── Ratings
└── Drivers
    ├── Status
    └── Current Trip
```

### Row Level Security (RLS)
All tables have RLS enabled:
- Users can only view/edit their own data
- Drivers can only view trips assigned to them
- Transactions and payments are user-scoped
- Admins can override with service role key

## API Routes

### Wallet Operations
```bash
# Get user wallet
GET /api/supabase/wallet

# Top up or withdraw
POST /api/supabase/wallet
Body: { type: 'topup' | 'withdrawal', amount: 500, description: 'Trip payment' }
```

### Trip Operations
```bash
# Get user trips
GET /api/supabase/trips?limit=10&status=pending

# Create new trip
POST /api/supabase/trips
Body: {
  pickup_lat: -25.7461,
  pickup_lng: 28.2311,
  dropoff_lat: -25.7580,
  dropoff_lng: 28.2499,
  pickup_address: "Sandton, Johannesburg",
  dropoff_address: "Rosebank, Johannesburg",
  service_type: "ride",
  payment_method: "wallet"
}
```

## Usage Examples

### Client-Side (Browser)
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Get user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()

// Get wallet
const { data: wallet } = await supabase
  .from('wallets')
  .select('*')
  .eq('user_id', userId)
  .single()

// Create trip
const { data: trip } = await supabase
  .from('trips')
  .insert([{
    customer_id: userId,
    pickup_lat: -25.7461,
    pickup_lng: 28.2311,
    dropoff_lat: -25.7580,
    dropoff_lng: 28.2499,
    payment_method: 'wallet'
  }])
  .select()
  .single()
```

### Server-Side (API Routes)
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()

// Get authenticated user
const { data: { user } } = await supabase.auth.getUser()

// Query with auth context
const { data: trips } = await supabase
  .from('trips')
  .select('*')
  .eq('customer_id', user.id)
```

## Data Models

### Profiles
```sql
id (UUID) - User ID
role (user_role) - 'customer' | 'driver' | 'admin'
first_name, last_name
phone (UNIQUE)
email
avatar_url
rating (1-5)
verified (BOOLEAN)
biometric_enabled (BOOLEAN)
```

### Wallets (Panda Pay)
```sql
id (UUID)
user_id (UUID) - Foreign key to profiles
balance (DECIMAL) - Available balance
pending_balance (DECIMAL) - Pending earnings
total_earned (DECIMAL) - Lifetime earnings
total_spent (DECIMAL) - Lifetime spending
currency (TEXT) - 'ZAR'
auto_payout_enabled (BOOLEAN)
```

### Trips
```sql
id (UUID)
customer_id (UUID)
driver_id (UUID) - NULL until accepted
pickup_lat, pickup_lng
dropoff_lat, dropoff_lng
status (trip_status) - 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
base_fare, distance_km, duration_minutes
surge_multiplier (1.0 - 3.5)
total_fare
payment_method
payment_status
```

### Payments
```sql
id (UUID)
trip_id (UUID)
user_id (UUID)
amount (DECIMAL)
method (payment_method) - 'card' | 'wallet' | 'cash' | 'eft' | 'google_pay' | 'apple_pay'
status (payment_status) - 'pending' | 'completed' | 'failed' | 'refunded'
gateway_transaction_id
```

## Security Features

### Authentication
- Email/password authentication via Supabase Auth
- Biometric support (Face ID, Fingerprint)
- 2FA/MFA optional
- Session management with 7-day expiry

### Data Protection
- Row Level Security on all tables
- Users can only access their own data
- Service role key for admin operations
- Encrypted sensitive fields

### Compliance
- GDPR compliant data deletion
- Audit logs for transactions
- Payment PCI compliance
- ZAR currency localization

## Monitoring & Maintenance

### View Active Sessions
```typescript
const { data: sessions } = await supabase
  .from('sessions')
  .select('*')
  .eq('user_id', userId)
  .eq('isActive', true)
```

### Check Wallet Health
```typescript
const { data: wallet } = await supabase
  .from('wallets')
  .select('balance, pending_balance, total_earned')
  .eq('user_id', userId)
  .single()
```

### View Trip History
```typescript
const { data: trips } = await supabase
  .from('trips')
  .select('*')
  .eq('customer_id', userId)
  .order('created_at', { ascending: false })
```

## Troubleshooting

### Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and keys are set
- Check Supabase project is active
- Test connection: `npm run supabase:test`

### RLS Denials
- Verify user is authenticated (`auth.uid()` returns value)
- Check user role has correct permissions
- For admin operations, use service role key

### Query Performance
- Indexes are automatically created on foreign keys
- Add custom indexes for frequently filtered columns
- Use `.select()` to limit returned fields

## Deployment

### Production Checklist
- [ ] All environment variables set in production
- [ ] RLS policies reviewed and tested
- [ ] Backups configured in Supabase
- [ ] Rate limiting enabled
- [ ] SSL certificate valid
- [ ] Monitoring alerts set up

## Next Steps
1. Run `node scripts/init-supabase.js` to initialize database
2. Update wallet integration with payment gateways
3. Implement real-time features with Supabase subscriptions
4. Set up automated backups and monitoring
