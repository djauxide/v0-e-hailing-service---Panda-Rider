"use client";

import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function ReportingPage() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-01-31' });

  // Sample data
  const revenueData = [
    { date: '2024-01-01', revenue: 45000, trips: 120, platformFee: 9000 },
    { date: '2024-01-02', revenue: 52000, trips: 135, platformFee: 10400 },
    { date: '2024-01-03', revenue: 48000, trips: 128, platformFee: 9600 },
    { date: '2024-01-04', revenue: 61000, trips: 155, platformFee: 12200 },
    { date: '2024-01-05', revenue: 55000, trips: 142, platformFee: 11000 },
  ];

  const driverPerformanceData = [
    { name: 'Mike Johnson', trips: 234, rating: 4.8, earnings: 45200 },
    { name: 'Sarah Lee', trips: 189, rating: 4.9, earnings: 38400 },
    { name: 'Tom Brown', trips: 156, rating: 4.6, earnings: 31200 },
    { name: 'Lisa Chen', trips: 142, rating: 4.7, earnings: 28400 },
  ];

  const paymentMethodData = [
    { method: 'Stripe', count: 8542, amount: 1285300, percentage: 35.2 },
    { method: 'Google Pay', count: 6821, amount: 1023150, percentage: 28.0 },
    { method: 'Apple Pay', count: 4532, amount: 679800, percentage: 18.6 },
    { method: 'PayFast', count: 2145, amount: 321750, percentage: 8.8 },
    { method: 'Wallet', count: 1923, amount: 288450, percentage: 7.9 },
    { method: 'Cash', count: 1037, amount: 155550, percentage: 4.3 },
  ];

  const userAcquisitionData = [
    { period: '2024-01-01', customers: 145, drivers: 32, cumulative: 1847 },
    { period: '2024-01-02', customers: 128, drivers: 28, cumulative: 2003 },
    { period: '2024-01-03', customers: 156, drivers: 35, cumulative: 2194 },
    { period: '2024-01-04', customers: 182, drivers: 42, cumulative: 2418 },
    { period: '2024-01-05', customers: 164, drivers: 38, cumulative: 2620 },
  ];

  const serviceAreaData = [
    { area: 'Sandton', trips: 542, revenue: 123400, drivers: 84, customers: 356 },
    { area: 'CBD', trips: 421, revenue: 95800, drivers: 62, customers: 278 },
    { area: 'Rosebank', trips: 389, revenue: 88500, drivers: 58, customers: 245 },
    { area: 'Midrand', trips: 312, revenue: 71200, drivers: 45, customers: 198 },
    { area: 'Pretoria', trips: 287, revenue: 65300, drivers: 38, customers: 182 },
  ];

  const fraudDetectionData = [
    { type: 'Multiple Cancellations', count: 47, percentage: 28.5 },
    { type: 'Payment Failures', count: 38, percentage: 23.0 },
    { type: 'Suspicious Locations', count: 35, percentage: 21.2 },
    { type: 'Rating Abuse', count: 28, percentage: 17.0 },
    { type: 'Account Abuse', count: 17, percentage: 10.3 },
  ];

  const COLORS = ['#DC2626', '#2563EB', '#16A34A', '#F59E0B', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500">Comprehensive business intelligence dashboard</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <button className="ml-auto px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
            Generate Report
          </button>
        </div>

        {/* Report Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 px-4 flex gap-8">
            {[
              { id: 'revenue', label: 'Revenue', icon: '📊' },
              { id: 'driver', label: 'Driver Performance', icon: '👨‍💼' },
              { id: 'users', label: 'User Acquisition', icon: '👥' },
              { id: 'payments', label: 'Payment Methods', icon: '💳' },
              { id: 'areas', label: 'Service Areas', icon: '📍' },
              { id: 'fraud', label: 'Fraud Detection', icon: '🛡️' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Revenue Report */}
          {activeTab === 'revenue' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                  <p className="text-sm text-blue-100">Total Revenue</p>
                  <p className="text-3xl font-bold mt-2">R256,000</p>
                  <p className="text-xs text-blue-100 mt-1">+15% from previous period</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                  <p className="text-sm text-green-100">Platform Fee</p>
                  <p className="text-3xl font-bold mt-2">R51,200</p>
                  <p className="text-xs text-green-100 mt-1">20% of revenue</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                  <p className="text-sm text-purple-100">Driver Payout</p>
                  <p className="text-3xl font-bold mt-2">R204,800</p>
                  <p className="text-xs text-purple-100 mt-1">80% of revenue</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                  <p className="text-sm text-orange-100">Total Trips</p>
                  <p className="text-3xl font-bold mt-2">680</p>
                  <p className="text-xs text-orange-100 mt-1">Average: 136/day</p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#2563EB" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Driver Performance Report */}
          {activeTab === 'driver' && (
            <div className="p-6 space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Driver</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900">Trips</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900">Rating</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverPerformanceData.map((driver, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-300 rounded-full" />
                            <span className="font-medium text-gray-900">{driver.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">{driver.trips}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span className="font-medium text-gray-900">{driver.rating}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">R{driver.earnings.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* User Acquisition Report */}
          {activeTab === 'users' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-600">New Customers</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">775</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-gray-600">New Drivers</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">173</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-gray-600">Total New Users</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">948</p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">User Growth Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userAcquisitionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="customers" stroke="#2563EB" name="Customers" strokeWidth={2} />
                    <Line yAxisId="left" type="monotone" dataKey="drivers" stroke="#16A34A" name="Drivers" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#F59E0B" name="Cumulative" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Payment Methods Report */}
          {activeTab === 'payments' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Payment Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={paymentMethodData} cx="50%" cy="50%" labelLine={false} label={({ method, percentage }) => `${method}: ${percentage}%`} outerRadius={80} fill="#8884d8" dataKey="amount">
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Method</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900">Transactions</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-900">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentMethodData.map((method, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{method.method}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{method.count.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">R{method.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Service Areas Report */}
          {activeTab === 'areas' && (
            <div className="p-6 space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Area</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900">Trips</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900">Revenue</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900">Drivers</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900">Customers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceAreaData.map((area, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{area.area}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{area.trips}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">R{area.revenue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{area.drivers}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{area.customers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fraud Detection Report */}
          {activeTab === 'fraud' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-gray-600">Total Alerts</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">165</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-sm text-gray-600">Suspended Accounts</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">23</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <p className="text-sm text-gray-600">Under Review</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">12</p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Fraud Alert Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fraudDetectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#DC2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-lg shadow p-4 flex gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Download as PDF
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
            Download as CSV
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-300">
            Print Report
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-300">
            Email Report
          </button>
        </div>
      </main>
    </div>
  );
}
