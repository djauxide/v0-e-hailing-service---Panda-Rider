'use client';

import { useState } from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Panda Rider Admin</h1>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'users', 'drivers', 'trips', 'payments', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'drivers' && <DriversTab />}
        {activeTab === 'trips' && <TripsTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </main>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Users" value="1,250" />
      <StatCard title="Total Drivers" value="320" />
      <StatCard title="Active Trips" value="45" />
      <StatCard title="Revenue" value="$12,450" />
    </div>
  );
}

function UsersTab() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Users Management</h2>
      </div>
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {[1, 2, 3].map((item) => (
            <tr key={item}>
              <td className="px-6 py-4 text-sm">John Doe {item}</td>
              <td className="px-6 py-4 text-sm">john{item}@example.com</td>
              <td className="px-6 py-4 text-sm"><span className="bg-green-100 text-green-800 px-2 py-1 rounded">Active</span></td>
              <td className="px-6 py-4 text-sm"><button className="text-blue-600 hover:underline">View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DriversTab() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Drivers Management</h2>
      </div>
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Vehicle</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Rating</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {[1, 2, 3].map((item) => (
            <tr key={item}>
              <td className="px-6 py-4 text-sm">Driver {item}</td>
              <td className="px-6 py-4 text-sm">Toyota Prius</td>
              <td className="px-6 py-4 text-sm">4.8 ⭐</td>
              <td className="px-6 py-4 text-sm"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Online</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TripsTab() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Trips Monitoring</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Trip #{1000 + item}</p>
                  <p className="text-sm text-gray-600">Location A → Location B</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded">In Progress</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PaymentsTab() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Payments</h2>
      </div>
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">Transaction ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {[1, 2, 3].map((item) => (
            <tr key={item}>
              <td className="px-6 py-4 text-sm">TXN{1000 + item}</td>
              <td className="px-6 py-4 text-sm">$15.50</td>
              <td className="px-6 py-4 text-sm"><span className="bg-green-100 text-green-800 px-2 py-1 rounded">Completed</span></td>
              <td className="px-6 py-4 text-sm">2024-01-{10 + item}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
        <div className="h-64 bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Chart placeholder</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Trip Distribution</h3>
        <div className="h-64 bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Chart placeholder</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}
