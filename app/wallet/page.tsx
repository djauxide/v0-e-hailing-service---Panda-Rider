"use client";

import { useState } from "react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

type TabType = "overview" | "send" | "request" | "topup" | "withdraw" | "history";

const transactionHistory = [
  { id: "TRF-001", type: "transfer_in", amount: 500, description: "From Thabo M.", date: "2024-03-13 14:32", status: "completed" },
  { id: "PAY-002", type: "payment", amount: -153, description: "Trip Payment", date: "2024-03-13 12:15", status: "completed" },
  { id: "TOP-003", type: "topup", amount: 1000, description: "Card Top-up", date: "2024-03-12 18:45", status: "completed" },
  { id: "TRF-004", type: "transfer_out", amount: -250, description: "To Naledi K.", date: "2024-03-12 10:20", status: "completed" },
  { id: "CB-005", type: "cashback", amount: 15, description: "Trip Cashback", date: "2024-03-11 22:30", status: "completed" },
  { id: "WD-006", type: "withdrawal", amount: -500, description: "Bank Withdrawal", date: "2024-03-10 09:00", status: "pending" },
];

const balanceHistory = [
  { day: "Mon", balance: 1200 },
  { day: "Tue", balance: 1450 },
  { day: "Wed", balance: 1100 },
  { day: "Thu", balance: 1600 },
  { day: "Fri", balance: 1350 },
  { day: "Sat", balance: 1800 },
  { day: "Sun", balance: 2150 },
];

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sendAmount, setSendAmount] = useState("");
  const [sendPhone, setSendPhone] = useState("");
  const [sendNote, setSendNote] = useState("");
  const [topupAmount, setTopupAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [requestAmount, setRequestAmount] = useState("");
  const [requestPhone, setRequestPhone] = useState("");

  const walletBalance = 2150.00;
  const pendingAmount = 500.00;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">PR</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Panda Wallet</h1>
                <p className="text-xs text-slate-400">Fintech Services</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors">
                Dashboard
              </Link>
              <Link href="/rider" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                Book Ride
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <p className="text-red-200 text-sm mb-1">Available Balance</p>
            <h2 className="text-5xl font-bold text-white mb-2">R{walletBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</h2>
            <p className="text-red-200 text-sm">Pending: R{pendingAmount.toFixed(2)}</p>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setActiveTab("topup")}
                className="px-6 py-2 bg-white text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                Top Up
              </button>
              <button 
                onClick={() => setActiveTab("send")}
                className="px-6 py-2 bg-white/20 text-white rounded-lg text-sm font-semibold hover:bg-white/30 transition-colors"
              >
                Send Money
              </button>
              <button 
                onClick={() => setActiveTab("withdraw")}
                className="px-6 py-2 bg-white/20 text-white rounded-lg text-sm font-semibold hover:bg-white/30 transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Send Money", icon: "arrow-up", tab: "send" as TabType, color: "from-blue-500 to-blue-600" },
            { label: "Request", icon: "arrow-down", tab: "request" as TabType, color: "from-green-500 to-green-600" },
            { label: "Pay Bills", icon: "receipt", tab: "overview" as TabType, color: "from-purple-500 to-purple-600" },
            { label: "Buy Airtime", icon: "phone", tab: "overview" as TabType, color: "from-orange-500 to-orange-600" },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => setActiveTab(action.tab)}
              className={`bg-gradient-to-r ${action.color} p-4 rounded-xl text-white text-left hover:opacity-90 transition-opacity`}
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {action.icon === "arrow-up" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />}
                  {action.icon === "arrow-down" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />}
                  {action.icon === "receipt" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                  {action.icon === "phone" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />}
                </svg>
              </div>
              <p className="font-semibold">{action.label}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: "overview" as TabType, label: "Overview" },
                { id: "send" as TabType, label: "Send" },
                { id: "request" as TabType, label: "Request" },
                { id: "topup" as TabType, label: "Top Up" },
                { id: "withdraw" as TabType, label: "Withdraw" },
                { id: "history" as TabType, label: "History" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "bg-red-600 text-white"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur">
              {activeTab === "overview" && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Balance Trend</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={balanceHistory}>
                      <defs>
                        <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="day" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="balance" stroke="#DC2626" fill="url(#balanceGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeTab === "send" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Send Money</h3>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Recipient Phone Number</label>
                    <input
                      type="tel"
                      value={sendPhone}
                      onChange={(e) => setSendPhone(e.target.value)}
                      placeholder="+27 XX XXX XXXX"
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Amount (ZAR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">R</span>
                      <input
                        type="number"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Note (optional)</label>
                    <input
                      type="text"
                      value={sendNote}
                      onChange={(e) => setSendNote(e.target.value)}
                      placeholder="What's this for?"
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                      <span>Transfer fee (1%)</span>
                      <span>R{sendAmount ? (parseFloat(sendAmount) * 0.01).toFixed(2) : "0.00"}</span>
                    </div>
                    <div className="flex justify-between text-white font-semibold">
                      <span>Total</span>
                      <span>R{sendAmount ? (parseFloat(sendAmount) * 1.01).toFixed(2) : "0.00"}</span>
                    </div>
                  </div>
                  <button className="w-full bg-red-600 text-white rounded-xl py-4 font-semibold hover:bg-red-700 transition-colors">
                    Send Money
                  </button>
                </div>
              )}

              {activeTab === "request" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Request Money</h3>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Request From (Phone)</label>
                    <input
                      type="tel"
                      value={requestPhone}
                      onChange={(e) => setRequestPhone(e.target.value)}
                      placeholder="+27 XX XXX XXXX"
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Amount (ZAR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">R</span>
                      <input
                        type="number"
                        value={requestAmount}
                        onChange={(e) => setRequestAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                  <button className="w-full bg-green-600 text-white rounded-xl py-4 font-semibold hover:bg-green-700 transition-colors">
                    Send Request
                  </button>
                </div>
              )}

              {activeTab === "topup" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Up Wallet</h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[100, 250, 500, 1000, 2000, 5000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setTopupAmount(amt.toString())}
                        className={`p-3 rounded-xl border text-sm font-semibold transition-colors ${
                          topupAmount === amt.toString()
                            ? "bg-red-600 border-red-600 text-white"
                            : "bg-slate-700 border-slate-600 text-slate-300 hover:border-red-500"
                        }`}
                      >
                        R{amt}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Or enter custom amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">R</span>
                      <input
                        type="number"
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-sm text-slate-400 mb-2">Payment Method</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                      <span className="text-white">**** 4242</span>
                      <button className="ml-auto text-red-400 text-sm">Change</button>
                    </div>
                  </div>
                  <button className="w-full bg-red-600 text-white rounded-xl py-4 font-semibold hover:bg-red-700 transition-colors">
                    Top Up R{topupAmount || "0.00"}
                  </button>
                </div>
              )}

              {activeTab === "withdraw" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Withdraw to Bank</h3>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Amount (ZAR)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">R</span>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        max={walletBalance}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Available: R{walletBalance.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <p className="text-sm text-slate-400 mb-2">Withdraw To</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">FNB</div>
                      <div>
                        <p className="text-white text-sm font-medium">First National Bank</p>
                        <p className="text-slate-400 text-xs">**** 5678</p>
                      </div>
                      <button className="ml-auto text-red-400 text-sm">Change</button>
                    </div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <p className="text-yellow-400 text-sm">Withdrawals are processed within 1-2 business days.</p>
                  </div>
                  <button className="w-full bg-red-600 text-white rounded-xl py-4 font-semibold hover:bg-red-700 transition-colors">
                    Withdraw R{withdrawAmount || "0.00"}
                  </button>
                </div>
              )}

              {activeTab === "history" && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Transaction History</h3>
                  <div className="space-y-3">
                    {transactionHistory.map((tx) => (
                      <div key={tx.id} className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-xl">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.amount > 0 ? "bg-green-500/20" : "bg-red-500/20"
                        }`}>
                          <svg className={`w-5 h-5 ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {tx.amount > 0 
                              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            }
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{tx.description}</p>
                          <p className="text-slate-400 text-xs">{tx.date}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${tx.amount > 0 ? "text-green-400" : "text-white"}`}>
                            {tx.amount > 0 ? "+" : ""}R{Math.abs(tx.amount).toFixed(2)}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            tx.status === "completed" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Linked Accounts */}
            <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur">
              <h3 className="text-lg font-semibold text-white mb-4">Linked Accounts</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">VISA</div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">Visa Debit</p>
                    <p className="text-slate-400 text-xs">**** 4242</p>
                  </div>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Default</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">FNB</div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">FNB Cheque</p>
                    <p className="text-slate-400 text-xs">**** 5678</p>
                  </div>
                </div>
                <button className="w-full py-3 border border-dashed border-slate-600 rounded-xl text-slate-400 text-sm hover:border-red-500 hover:text-red-400 transition-colors">
                  + Add Account
                </button>
              </div>
            </div>

            {/* Limits */}
            <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur">
              <h3 className="text-lg font-semibold text-white mb-4">Your Limits</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Daily Limit</span>
                    <span className="text-white">R2,500 / R5,000</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full" style={{ width: "50%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Monthly Limit</span>
                    <span className="text-white">R45,000 / R150,000</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full" style={{ width: "30%" }} />
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 py-2 bg-red-600/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-600/30 transition-colors">
                Upgrade to Premium
              </button>
            </div>

            {/* WhatsApp Support */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold">WhatsApp Support</p>
                  <p className="text-green-200 text-xs">24/7 Available</p>
                </div>
              </div>
              <p className="text-green-100 text-sm mb-4">Get instant support and notifications via WhatsApp.</p>
              <a href="https://wa.me/27800726632" target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-white text-green-600 rounded-xl text-center text-sm font-semibold hover:bg-green-50 transition-colors">
                Chat Now
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
