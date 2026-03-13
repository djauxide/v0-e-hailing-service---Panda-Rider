"use client";

import { useState } from "react";
import Link from "next/link";

type Screen = "home" | "request" | "active" | "arrived" | "earnings" | "profile";

export default function DriverApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState<"today" | "week" | "month">("today");

  const earningsData = {
    today: { amount: "R1,573.20", trips: 8, hours: "5.2" },
    week: { amount: "R7,624.80", trips: 38, hours: "28.4" },
    month: { amount: "R33,156.00", trips: 156, hours: "112.0" },
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-start py-10 px-4">
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">PR</span>
          </div>
          <span className="font-bold text-white text-lg">Panda Rider</span>
        </Link>
        <div className="flex gap-3">
          <Link href="/rider" className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium border border-white/20">Rider App</Link>
          <Link href="/driver" className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-medium">Driver App</Link>
        </div>
      </div>

      <div className="w-full max-w-5xl flex gap-10 items-start">
        {/* Phone mockup */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-[320px] bg-black rounded-[44px] shadow-2xl overflow-hidden border-[6px] border-gray-800">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-800" />
              <div className="w-4 h-1.5 rounded-full bg-gray-800" />
            </div>

            <div className="w-full h-[620px] overflow-hidden bg-gray-900 text-white">

              {/* HOME SCREEN */}
              {screen === "home" && (
                <div className="h-full flex flex-col">
                  {/* Map */}
                  <div className="flex-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gray-800">
                      <svg className="w-full h-full opacity-20">
                        {[...Array(10)].map((_, i) => (
                          <line key={`h${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#6b7280" strokeWidth="1" />
                        ))}
                        {[...Array(10)].map((_, i) => (
                          <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="400" stroke="#6b7280" strokeWidth="1" />
                        ))}
                      </svg>
                      {/* Roads */}
                      <div className="absolute top-1/3 left-0 right-0 h-5 bg-gray-600 opacity-50" />
                      <div className="absolute left-2/5 top-0 bottom-0 w-4 bg-gray-600 opacity-50" />
                      <div className="absolute top-2/3 left-0 right-0 h-3 bg-gray-600 opacity-40" />
                      {/* Demand dots */}
                      {[[60, 80], [180, 120], [250, 200], [100, 250], [200, 300]].map(([x, y], i) => (
                        <div key={i} className="absolute w-3 h-3 bg-red-500 rounded-full opacity-60 animate-pulse" style={{ left: x, top: y }} />
                      ))}
                    </div>
                    {/* Driver position */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-10 h-10 bg-red-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                        <span className="text-lg">🐼</span>
                      </div>
                    </div>
                    {/* Status bar */}
                    <div className="absolute top-6 left-4 right-4 flex justify-between text-xs text-gray-300">
                      <span>9:41</span><span>▲▲▲ 100%</span>
                    </div>
                    {/* Online toggle */}
                    <div className="absolute top-12 left-4 right-4 flex justify-between items-center">
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${isOnline ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"}`}>
                        {isOnline ? "Online" : "Offline"}
                      </div>
                      <div className="bg-gray-800/80 rounded-full px-3 py-1.5 text-xs text-gray-300">
                        8 nearby rides
                      </div>
                    </div>
                  </div>

                  {/* Bottom panel */}
                  <div className="bg-gray-900 px-4 pt-4 pb-5">
                    <div className="w-8 h-1 bg-gray-700 rounded mx-auto mb-4" />
                    {/* Today stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[["R1,573", "Today"], ["8", "Trips"], ["4.9", "Rating"]].map(([val, label]) => (
                        <div key={label} className="bg-gray-800 rounded-xl p-3 text-center">
                          <p className="font-bold text-white text-sm">{val}</p>
                          <p className="text-gray-400 text-xs">{label}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => { setIsOnline(!isOnline); if (!isOnline) setScreen("request"); }}
                      className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-colors ${isOnline ? "bg-gray-700 text-white" : "bg-red-600 text-white"}`}
                    >
                      {isOnline ? "Go Offline" : "Go Online"}
                    </button>
                    <div className="flex justify-between mt-4">
                      {[["home", "🗺", "Map"], ["earnings", "💰", "Earnings"], ["profile", "👤", "Profile"]].map(([s, icon, label]) => (
                        <button key={s} onClick={() => setScreen(s as Screen)} className={`flex-1 flex flex-col items-center py-2 rounded-xl text-xs ${screen === s ? "text-red-400" : "text-gray-500"}`}>
                          <span className="text-base mb-0.5">{icon}</span>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* RIDE REQUEST SCREEN */}
              {screen === "request" && (
                <div className="h-full flex flex-col items-center justify-center bg-gray-900 px-5">
                  <div className="w-full bg-gray-800 rounded-3xl p-5 mb-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-gray-400 text-xs">New ride request</p>
                        <h2 className="text-xl font-bold text-white">John Doe</h2>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-400 text-xs">★★★★★</span>
                          <span className="text-gray-400 text-xs">4.8 • 24 trips</span>
                        </div>
                      </div>
                      <div className="bg-red-600 px-3 py-1.5 rounded-xl text-center">
                        <p className="text-white font-bold text-base">R153.00</p>
                        <p className="text-red-200 text-xs">2.4 km</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400 mt-1 shrink-0" />
                        <div>
                          <p className="text-gray-400 text-xs">Pickup</p>
                          <p className="text-white text-xs font-medium">123 Main St, Downtown</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400 mt-1 shrink-0" />
                        <div>
                          <p className="text-gray-400 text-xs">Dropoff</p>
                          <p className="text-white text-xs font-medium">456 Market Ave, Eastside</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs text-gray-400 border-t border-gray-700 pt-3">
                      <span>5 min pickup</span>
                      <span>•</span>
                      <span>12 min trip</span>
                      <span>•</span>
                      <span>Cash</span>
                    </div>
                  </div>
                  {/* Timer */}
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-full border-2 border-red-600 flex items-center justify-center">
                      <span className="text-red-400 text-xs font-bold">15s</span>
                    </div>
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-red-600 rounded-full" />
                    </div>
                  </div>
                  <div className="flex gap-3 w-full">
                    <button onClick={() => setScreen("home")} className="flex-1 py-3.5 bg-gray-800 text-white rounded-2xl text-sm font-semibold">
                      Decline
                    </button>
                    <button onClick={() => setScreen("active")} className="flex-1 py-3.5 bg-red-600 text-white rounded-2xl text-sm font-semibold">
                      Accept
                    </button>
                  </div>
                </div>
              )}

              {/* ACTIVE TRIP */}
              {screen === "active" && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 bg-gray-800 relative overflow-hidden">
                    <svg className="w-full h-full opacity-10">
                      {[...Array(8)].map((_, i) => (
                        <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke="#6b7280" strokeWidth="1" />
                      ))}
                    </svg>
                    <svg className="absolute inset-0 w-full h-full">
                      <path d="M 60 300 Q 150 220 240 140" stroke="#DC2626" strokeWidth="3" fill="none" strokeDasharray="8,4" />
                    </svg>
                    <div className="absolute" style={{ left: 50, top: 285 }}>
                      <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-sm shadow-md">🐼</div>
                    </div>
                    <div className="absolute" style={{ left: 230, top: 125 }}>
                      <div className="w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-xs">🏠</div>
                    </div>
                    <div className="absolute top-12 left-3 right-3 bg-black/70 rounded-xl p-3 flex justify-between">
                      <div>
                        <p className="text-gray-400 text-xs">Heading to</p>
                        <p className="text-white font-bold text-xs">456 Market Ave</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-sm">2.1 km</p>
                        <p className="text-gray-400 text-xs">8 min left</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-900 px-4 pt-4 pb-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">👤</div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">John Doe</p>
                        <p className="text-gray-400 text-xs">456 Market Ave, Eastside</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="w-8 h-8 bg-gray-800 rounded-full text-sm flex items-center justify-center">📞</button>
                        <button className="w-8 h-8 bg-gray-800 rounded-full text-sm flex items-center justify-center">💬</button>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-gray-800 text-white rounded-2xl text-xs font-medium">Issue</button>
                      <button onClick={() => setScreen("arrived")} className="flex-2 px-6 py-3 bg-red-600 text-white rounded-2xl text-sm font-bold">
                        Arrived
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ARRIVED SCREEN */}
              {screen === "arrived" && (
                <div className="h-full flex flex-col items-center justify-center bg-gray-900 px-6 text-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-4xl mb-4">✓</div>
                  <h2 className="text-xl font-bold text-white mb-1">Trip Complete!</h2>
                  <p className="text-gray-400 text-sm mb-6">You earned R153.00 for this trip</p>
                  <div className="w-full bg-gray-800 rounded-2xl p-4 space-y-2 mb-6">
                    {[["Distance", "2.4 km"], ["Duration", "12 min"], ["Earnings", "R153.00"], ["Service fee (20%)", "-R30.60"], ["Your payout", "R122.40"]].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-gray-400">{k}</span>
                        <span className={v.startsWith("-") ? "text-red-400" : k === "Your payout" ? "text-green-400 font-bold" : "text-white"}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => { setScreen("request"); setIsOnline(true); }}
                    className="w-full py-3.5 bg-red-600 text-white rounded-2xl text-sm font-bold mb-3"
                  >
                    Find Next Ride
                  </button>
                  <button onClick={() => setScreen("earnings")} className="text-xs text-gray-500 underline">View Earnings</button>
                </div>
              )}

              {/* EARNINGS SCREEN */}
              {screen === "earnings" && (
                <div className="h-full flex flex-col bg-gray-900">
                  <div className="bg-red-600 px-5 pt-10 pb-6">
                    <button onClick={() => setScreen("home")} className="text-red-200 text-xs mb-3">← Back</button>
                    <h2 className="text-white font-bold text-lg">Earnings</h2>
                    <div className="flex gap-2 mt-3">
                      {(["today", "week", "month"] as const).map((t) => (
                        <button key={t} onClick={() => setActiveTab(t)} className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${activeTab === t ? "bg-white text-red-600" : "bg-red-700 text-red-200"}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 px-4 py-4">
                    <div className="bg-gray-800 rounded-2xl p-5 mb-4 text-center">
                      <p className="text-gray-400 text-xs mb-1">Total Earned</p>
                      <p className="text-3xl font-bold text-white">{earningsData[activeTab].amount}</p>
                      <div className="flex justify-center gap-4 mt-3 text-xs text-gray-400">
                        <span>{earningsData[activeTab].trips} trips</span>
                        <span>•</span>
                        <span>{earningsData[activeTab].hours} hrs online</span>
                      </div>
                    </div>
                    {/* Mini bar chart */}
                    <div className="bg-gray-800 rounded-2xl p-4 mb-4">
                      <p className="text-xs text-gray-400 mb-3">Hourly breakdown</p>
                      <div className="flex items-end gap-1 h-16">
                        {[40, 65, 30, 80, 55, 90, 45, 70].map((h, i) => (
                          <div key={i} className="flex-1 bg-red-600 rounded-t opacity-80" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-600">
                        <span>6am</span><span>10am</span><span>2pm</span><span>6pm</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[["PandaGo rides", "R1,123.20", "6 trips"], ["PandaXL rides", "R324.00", "2 trips"], ["Tips", "R126.00", ""]].map(([cat, amt, trips]) => (
                        <div key={cat} className="flex justify-between items-center bg-gray-800 rounded-xl p-3">
                          <div>
                            <p className="text-white text-xs font-medium">{cat}</p>
                            {trips && <p className="text-gray-500 text-xs">{trips}</p>}
                          </div>
                          <p className="text-green-400 font-bold text-sm">{amt}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PROFILE SCREEN */}
              {screen === "profile" && (
                <div className="h-full flex flex-col bg-gray-900">
                  <div className="bg-gray-800 px-5 pt-10 pb-6 flex items-center gap-4">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-3xl">🐼</div>
                    <div>
                      <h2 className="text-white font-bold text-lg">David Chen</h2>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-yellow-400 text-sm">★★★★★</span>
                        <span className="text-gray-400 text-xs">4.9 • Pro Driver</span>
                      </div>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full mt-1 inline-block">Verified</span>
                    </div>
                  </div>
                  <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
                    <div className="grid grid-cols-3 gap-2">
                      {[["1,024", "Trips"], ["98%", "Accept"], ["4.9", "Rating"]].map(([v, l]) => (
                        <div key={l} className="bg-gray-800 rounded-xl p-3 text-center">
                          <p className="text-white font-bold text-sm">{v}</p>
                          <p className="text-gray-400 text-xs">{l}</p>
                        </div>
                      ))}
                    </div>
                    {[["Vehicle", "Toyota Camry 2022 • ABC 1234"], ["Documents", "All verified"], ["Bank Account", "•••• 5678 (Active)"], ["Support", "Get help"]].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between bg-gray-800 rounded-xl p-4">
                        <div>
                          <p className="text-gray-400 text-xs">{label}</p>
                          <p className="text-white text-xs font-medium mt-0.5">{value}</p>
                        </div>
                        <span className="text-gray-500 text-xs">›</span>
                      </div>
                    ))}
                    <button onClick={() => setScreen("home")} className="w-full py-3 bg-gray-800 text-gray-400 rounded-2xl text-xs font-medium">
                      Back to Map
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Home indicator */}
            <div className="bg-black h-6 flex items-center justify-center">
              <div className="w-24 h-1 bg-gray-700 rounded-full" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex-1 max-w-sm space-y-5">
          <div>
            <h1 className="text-3xl font-bold text-white text-balance">Panda Driver</h1>
            <p className="text-gray-400 mt-2 text-sm leading-relaxed">Driver-facing mobile app for accepting trips, real-time navigation, earnings tracking, and account management.</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">App Screens</p>
            <div className="grid grid-cols-2 gap-2">
              {([["home", "Home & Map"], ["request", "Ride Request"], ["active", "Active Trip"], ["arrived", "Trip Complete"], ["earnings", "Earnings"], ["profile", "Driver Profile"]] as [Screen, string][]).map(([s, label]) => (
                <button
                  key={s}
                  onClick={() => setScreen(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors ${screen === s ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300 border border-gray-700 hover:border-red-800"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Features</p>
            {["Online/offline toggle", "Real-time trip request alerts", "Turn-by-turn navigation", "In-app passenger messaging", "Daily, weekly, monthly earnings", "Document & vehicle management"].map((f) => (
              <div key={f} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-red-900 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                </div>
                <p className="text-xs text-gray-400">{f}</p>
              </div>
            ))}
          </div>
          <Link href="/rider" className="block w-full py-3 bg-white text-gray-900 rounded-2xl text-sm font-semibold text-center">
            ← View Rider App
          </Link>
        </div>
      </div>
    </div>
  );
}
