"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-muted-foreground text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-primary mt-2">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const revenueData = [
    { month: 'Jan', revenue: 4000, trips: 240 },
    { month: 'Feb', revenue: 3000, trips: 221 },
    { month: 'Mar', revenue: 2000, trips: 229 },
    { month: 'Apr', revenue: 2780, trips: 200 },
    { month: 'May', revenue: 1890, trips: 229 },
    { month: 'Jun', revenue: 2390, trips: 200 },
  ];

  const servicesData = [
    { name: 'Rides', value: 45 },
    { name: 'Food', value: 30 },
    { name: 'Courier', value: 25 },
  ];

  const COLORS = ['#DC2626', '#2563EB', '#16A34A'];

  const tripsData = [
    { id: 'TR001', service: 'Ride', passenger: 'John Doe', driver: 'Mike Johnson', status: 'Completed', fare: '$28.50' },
    { id: 'TR002', service: 'Food', passenger: 'Jane Smith', driver: 'Sarah Lee', status: 'In Progress', fare: '$45.00' },
    { id: 'TR003', service: 'Courier', passenger: 'Bob Wilson', driver: 'Tom Brown', status: 'Pending', fare: '$12.00' },
  ];

  const driversData = [
    { id: 'D001', name: 'Mike Johnson', trips: 234, rating: 4.8, status: 'Online' },
    { id: 'D002', name: 'Sarah Lee', trips: 189, rating: 4.9, status: 'Online' },
    { id: 'D003', name: 'Tom Brown', trips: 156, rating: 4.6, status: 'Offline' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary">Panda Rider</h1>
              <p className="text-sm text-muted-foreground">Multi-Service E-Hailing Admin</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value="2,847" subtitle="+12% from last month" />
          <StatCard title="Active Drivers" value="384" subtitle="Currently Online" />
          <StatCard title="Active Trips" value="142" subtitle="In Progress" />
          <StatCard title="Today Revenue" value="$8,450" subtitle="+23% from yesterday" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Revenue & Trips</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#DC2626" name="Revenue ($)" />
                <Line yAxisId="right" type="monotone" dataKey="trips" stroke="#2563EB" name="Trips" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Services Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={servicesData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {servicesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Trips</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Trip ID</th>
                    <th className="text-left py-2 px-2">Service</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-right py-2 px-2">Fare</th>
                  </tr>
                </thead>
                <tbody>
                  {tripsData.map((trip) => (
                    <tr key={trip.id} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-2 font-mono">{trip.id}</td>
                      <td className="py-2 px-2">{trip.service}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trip.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          trip.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right font-semibold">{trip.fare}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Top Drivers</h2>
            <div className="space-y-4">
              {driversData.map((driver) => (
                <div key={driver.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{driver.name}</p>
                    <p className="text-xs text-muted-foreground">{driver.trips} trips • Rating: {driver.rating}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    driver.status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {driver.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
