"use client";

import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

function StatCard({ title, value, subtitle, trend }: { title: string; value: string; subtitle?: string; trend?: "up" | "down" }) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center justify-between mb-2">
        <p className="text-muted-foreground text-sm">{title}</p>
        {trend && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
            {trend === 'up' ? '+' : '-'}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const revenueData = [
    { time: '00:00', revenue: 12000, trips: 45 },
    { time: '04:00', revenue: 8000, trips: 32 },
    { time: '08:00', revenue: 45000, trips: 156 },
    { time: '12:00', revenue: 38000, trips: 134 },
    { time: '16:00', revenue: 52000, trips: 178 },
    { time: '20:00', revenue: 48000, trips: 165 },
    { time: '24:00', revenue: 28000, trips: 98 },
  ];

  const tripsData = [
    { id: 'TR-7821', service: 'Ride', passenger: 'Thabo M.', driver: 'Mike J.', status: 'Completed', fare: 'R513' },
    { id: 'TR-7822', service: 'Food', passenger: 'Naledi K.', driver: 'Sarah L.', status: 'In Progress', fare: 'R810' },
    { id: 'TR-7823', service: 'Courier', passenger: 'Sipho N.', driver: 'Tom B.', status: 'Pending', fare: 'R216' },
    { id: 'TR-7824', service: 'Ride', passenger: 'Lerato P.', driver: 'James K.', status: 'Completed', fare: 'R342' },
  ];

  const driversData = [
    { id: 'D001', name: 'Mike Johnson', trips: 234, rating: 4.8, status: 'Online', earnings: 'R12,450' },
    { id: 'D002', name: 'Sarah Lee', trips: 189, rating: 4.9, status: 'Online', earnings: 'R9,870' },
    { id: 'D003', name: 'Tom Brown', trips: 156, rating: 4.6, status: 'Offline', earnings: 'R8,230' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">PR</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Panda Rider</h1>
                <p className="text-xs text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>
            
            <nav className="flex items-center gap-1">
              <Link href="/wallet" className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Panda Pay
              </Link>
              <Link href="/reports" className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                Reports
              </Link>
              <Link href="/rider" className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                Rider App
              </Link>
              <Link href="/driver" className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors">
                Driver App
              </Link>
              <div className="w-px h-6 bg-border mx-2" />
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-xs font-medium text-foreground">A</span>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Users" value="2,847" subtitle="+12% from last month" trend="up" />
          <StatCard title="Active Drivers" value="384" subtitle="Currently online" trend="up" />
          <StatCard title="Active Trips" value="142" subtitle="In progress now" />
          <StatCard title="Today Revenue" value="R152,100" subtitle="+23% from yesterday" trend="up" />
        </div>

        {/* Panda Brain Status */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-foreground font-semibold">Panda Brain AI Engine</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm text-primary">Running - Fully Automated</span>
                </div>
              </div>
            </div>
            <div className="flex gap-8">
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">12.5s</p>
                <p className="text-xs text-muted-foreground">Avg Match</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">1,247</p>
                <p className="text-xs text-muted-foreground">Processed</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-xs text-muted-foreground">Alerts</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Driver Matching", status: "active" },
              { label: "Surge Pricing", status: "active" },
              { label: "Fraud Detection", status: "active" },
              { label: "Auto Payouts", status: "active" },
              { label: "GPS Tracking", status: "active" },
            ].map((module) => (
              <div key={module.label} className="bg-secondary/50 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-foreground">{module.label}</span>
                <span className="w-2 h-2 rounded-full bg-primary" />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="col-span-8 bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-foreground font-semibold">Revenue Overview</h3>
                <p className="text-sm text-muted-foreground">Today&apos;s performance</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-chart-2" />
                  <span className="text-xs text-muted-foreground">Trips</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.01 260)" />
                <XAxis dataKey="time" stroke="oklch(0.5 0 0)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0 0)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'oklch(0.17 0.005 260)', 
                    border: '1px solid oklch(0.25 0.01 260)',
                    borderRadius: '8px',
                    color: 'oklch(0.95 0 0)'
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.65 0.2 145)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Gateways */}
          <div className="col-span-4 bg-card rounded-xl border border-border p-6">
            <h3 className="text-foreground font-semibold mb-4">Payment Gateways</h3>
            <div className="space-y-3">
              {[
                { name: "Stripe", amount: "R412,500", percentage: 32 },
                { name: "Google Pay", amount: "R189,320", percentage: 15 },
                { name: "Apple Pay", amount: "R156,780", percentage: 12 },
                { name: "PayFast", amount: "R234,120", percentage: 18 },
                { name: "Ozow EFT", amount: "R156,890", percentage: 12 },
                { name: "Cash", amount: "R127,340", percentage: 11 },
              ].map((gateway) => (
                <div key={gateway.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <span className="text-xs font-medium text-foreground">{gateway.name.charAt(0)}</span>
                    </div>
                    <span className="text-sm text-foreground">{gateway.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{gateway.amount}</p>
                    <p className="text-xs text-muted-foreground">{gateway.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Surge Pricing */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-foreground font-semibold">Surge Pricing</h3>
              <p className="text-sm text-muted-foreground">Real-time demand zones</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-chart-3/20 text-chart-3 text-sm font-medium">
              1.2x Average
            </span>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {[
              { area: "Sandton", multiplier: "1.5x", demand: "High" },
              { area: "CBD", multiplier: "1.3x", demand: "Medium" },
              { area: "Soweto", multiplier: "1.0x", demand: "Normal" },
              { area: "Rosebank", multiplier: "1.8x", demand: "Very High" },
              { area: "Pretoria", multiplier: "1.2x", demand: "Medium" },
            ].map((zone) => (
              <div key={zone.area} className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">{zone.area}</p>
                <p className="text-xl font-bold text-foreground mt-1">{zone.multiplier}</p>
                <p className="text-xs text-muted-foreground">{zone.demand}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Recent Trips */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground font-semibold">Recent Trips</h3>
              <Link href="/reports" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {tripsData.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <span className="text-xs font-mono text-muted-foreground">{trip.service.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{trip.passenger}</p>
                      <p className="text-xs text-muted-foreground">{trip.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{trip.fare}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      trip.status === 'Completed' ? 'bg-primary/20 text-primary' :
                      trip.status === 'In Progress' ? 'bg-chart-2/20 text-chart-2' :
                      'bg-chart-3/20 text-chart-3'
                    }`}>
                      {trip.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Drivers */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground font-semibold">Top Drivers</h3>
              <Link href="/driver" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {driversData.map((driver, index) => (
                <div key={driver.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-sm font-semibold text-foreground">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{driver.name}</p>
                      <p className="text-xs text-muted-foreground">{driver.trips} trips</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{driver.earnings}</p>
                    <div className="flex items-center gap-1 justify-end">
                      <svg className="w-3 h-3 text-chart-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs text-muted-foreground">{driver.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
