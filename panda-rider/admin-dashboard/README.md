# Panda Rider Admin Dashboard

Next.js 16 admin dashboard for managing the Panda Rider multi-service e-hailing platform.

## Features

- User management interface
- Driver monitoring and verification
- Live trip tracking
- Payment transaction history
- Analytics and revenue reports
- Multi-service trip management (rides, food, courier)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The dashboard will be available at `http://localhost:3000`

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

## Available Tabs

- **Overview**: Dashboard statistics and key metrics
- **Users**: Manage platform users
- **Drivers**: Monitor and verify drivers
- **Trips**: Track active and completed trips
- **Payments**: View transaction history
- **Analytics**: Revenue trends and insights
