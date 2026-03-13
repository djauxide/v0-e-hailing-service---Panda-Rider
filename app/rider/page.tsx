"use client";

import { useState } from "react";
import Link from "next/link";

const SCREENS = ["home", "booking", "searching", "tracking", "payment", "rating"] as const;
type Screen = typeof SCREENS[number];

export default function RiderApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [serviceType, setServiceType] = useState<"ride" | "food" | "courier">("ride");
  const [rating, setRating] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-10 px-4">
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">PR</span>
          </div>
          <span className="font-bold text-gray-800 text-lg">Panda Rider</span>
        </Link>
        <div className="flex gap-3">
          <Link href="/rider" className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-medium">Rider App</Link>
          <Link href="/driver" className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200">Driver App</Link>
        </div>
      </div>

      <div className="w-full max-w-5xl flex gap-10 items-start">
        {/* Phone mockup */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-[320px] bg-black rounded-[44px] shadow-2xl overflow-hidden border-[6px] border-black">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-800" />
              <div className="w-4 h-1.5 rounded-full bg-gray-800" />
            </div>

            {/* Screen content */}
            <div className="w-full h-[620px] overflow-hidden bg-white">

              {/* HOME SCREEN */}
              {screen === "home" && (
                <div className="h-full flex flex-col">
                  {/* Map area */}
                  <div className="flex-1 bg-gradient-to-br from-green-100 via-green-200 to-blue-100 relative overflow-hidden">
                    {/* Fake map grid */}
                    <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                      {[...Array(10)].map((_, i) => (
                        <line key={`h${i}`} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#4ade80" strokeWidth="1" />
                      ))}
                      {[...Array(10)].map((_, i) => (
                        <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="400" stroke="#4ade80" strokeWidth="1" />
                      ))}
                    </svg>
                    {/* Roads */}
                    <div className="absolute inset-0">
                      <div className="absolute top-1/3 left-0 right-0 h-6 bg-white opacity-60 rounded" />
                      <div className="absolute left-1/3 top-0 bottom-0 w-5 bg-white opacity-60 rounded" />
                    </div>
                    {/* Pin */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                      <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-red-600 mx-auto" />
                    </div>
                    {/* Top status bar */}
                    <div className="absolute top-6 left-0 right-0 flex justify-between items-center px-4 text-xs font-medium text-gray-700">
                      <span>9:41</span>
                      <span className="flex gap-1">
                        <span>▲▲▲</span>
                        <span>100%</span>
                      </span>
                    </div>
                    {/* Profile */}
                    <div className="absolute top-10 right-4 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">JD</span>
                    </div>
                    <div className="absolute top-10 left-4 bg-white rounded-full px-3 py-1 text-xs font-medium shadow">
                      Hi, John
                    </div>
                  </div>

                  {/* Bottom sheet */}
                  <div className="bg-white rounded-t-3xl px-5 pt-4 pb-6 shadow-lg">
                    <div className="w-10 h-1 bg-gray-300 rounded mx-auto mb-4" />
                    {/* Service tabs */}
                    <div className="flex gap-2 mb-4">
                      {(["ride", "food", "courier"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setServiceType(s)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${serviceType === s ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}
                        >
                          {s === "ride" ? "Ride" : s === "food" ? "Food" : "Courier"}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                        <input
                          className="bg-transparent text-xs flex-1 outline-none"
                          placeholder="Pickup location"
                          value={pickup}
                          onChange={(e) => setPickup(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                        <input
                          className="bg-transparent text-xs flex-1 outline-none"
                          placeholder="Where to?"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setScreen("booking")}
                      className="w-full py-3 bg-red-600 text-white rounded-2xl text-sm font-semibold"
                    >
                      Find a Panda
                    </button>
                  </div>
                </div>
              )}

              {/* BOOKING SCREEN */}
              {screen === "booking" && (
                <div className="h-full flex flex-col">
                  <div className="bg-red-600 px-5 pt-10 pb-6 text-white">
                    <button onClick={() => setScreen("home")} className="text-white/80 text-xs mb-3 flex items-center gap-1">
                      ← Back
                    </button>
                    <h2 className="text-lg font-bold">Choose a ride</h2>
                    <p className="text-xs text-red-200 mt-1">3 Pandas near you</p>
                  </div>
                  <div className="flex-1 bg-white px-4 py-4 overflow-y-auto space-y-3">
                    {[
                      { name: "PandaGo", seats: 4, time: "3 min", price: "R81.00", icon: "🐼" },
                      { name: "PandaXL", seats: 6, time: "5 min", price: "R129.60", icon: "🚐" },
                      { name: "PandaLux", seats: 4, time: "8 min", price: "R216.00", icon: "🏎" },
                    ].map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setScreen("searching")}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-red-300 hover:bg-red-50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">{opt.icon}</div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-800 text-sm">{opt.name}</p>
                          <p className="text-xs text-gray-400">{opt.seats} seats • {opt.time} away</p>
                        </div>
                        <span className="font-bold text-gray-800 text-sm">{opt.price}</span>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 pb-6 bg-white">
                    <div className="flex gap-2 mb-3">
                      {["Cash", "Card", "Wallet"].map((m) => (
                        <button key={m} className="flex-1 py-2 bg-gray-100 rounded-xl text-xs font-medium text-gray-600">{m}</button>
                      ))}
                    </div>
                    <div className="text-center text-xs text-gray-400">Select ride type above to confirm</div>
                  </div>
                </div>
              )}

              {/* SEARCHING SCREEN */}
              {screen === "searching" && (
                <div className="h-full flex flex-col items-center justify-center bg-white px-6">
                  <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6 relative">
                    <div className="w-20 h-20 rounded-full border-4 border-red-600 border-t-transparent animate-spin absolute" />
                    <span className="text-4xl">🐼</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Finding your Panda...</h2>
                  <p className="text-sm text-gray-500 text-center mb-8">We are matching you with the nearest driver</p>
                  <div className="w-full space-y-2">
                    {["Searching nearby drivers", "Calculating optimal route", "Confirming availability"].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-red-600" />
                        </div>
                        <span className="text-xs text-gray-600">{step}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setScreen("tracking")}
                    className="mt-10 w-full py-3 bg-red-600 text-white rounded-2xl text-sm font-semibold"
                  >
                    Driver Found! Track Now
                  </button>
                  <button onClick={() => setScreen("home")} className="mt-3 text-xs text-gray-400 underline">
                    Cancel
                  </button>
                </div>
              )}

              {/* TRACKING SCREEN */}
              {screen === "tracking" && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 bg-gradient-to-br from-blue-50 via-green-50 to-green-100 relative">
                    <svg className="absolute inset-0 w-full h-full opacity-20">
                      {[...Array(8)].map((_, i) => (
                        <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke="#22c55e" strokeWidth="1" />
                      ))}
                      {[...Array(8)].map((_, i) => (
                        <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="400" stroke="#22c55e" strokeWidth="1" />
                      ))}
                    </svg>
                    {/* Route line */}
                    <svg className="absolute inset-0 w-full h-full">
                      <path d="M 60 280 Q 160 200 250 140" stroke="#DC2626" strokeWidth="3" fill="none" strokeDasharray="6,3" />
                    </svg>
                    {/* Driver */}
                    <div className="absolute" style={{ left: 55, top: 265 }}>
                      <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white flex items-center justify-center shadow-md text-sm">🐼</div>
                    </div>
                    {/* Destination */}
                    <div className="absolute" style={{ left: 240, top: 125 }}>
                      <div className="w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-xs shadow-md">★</div>
                    </div>
                    {/* ETA badge */}
                    <div className="absolute top-12 left-4 right-4 bg-white rounded-2xl p-3 shadow-md flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Driver is</p>
                        <p className="font-bold text-gray-800 text-sm">2 min away</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">ETA</p>
                        <p className="font-bold text-red-600 text-sm">10:47 AM</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white px-4 pt-4 pb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-xl">🐼</div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm">David Chen</p>
                        <p className="text-xs text-gray-500">Toyota Camry • ABC 1234</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-yellow-400 text-xs">★★★★★</span>
                          <span className="text-xs text-gray-500">4.9</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm">📞</button>
                        <button className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm">💬</button>
                      </div>
                    </div>
                    <button
                      onClick={() => setScreen("payment")}
                      className="w-full py-3 bg-red-600 text-white rounded-2xl text-sm font-semibold"
                    >
                      Trip Complete - Pay Now
                    </button>
                  </div>
                </div>
              )}

              {/* PAYMENT SCREEN */}
              {screen === "payment" && (
                <div className="h-full flex flex-col bg-white">
                  <div className="bg-red-600 px-5 pt-10 pb-8 text-white">
                    <p className="text-sm text-red-200 mb-1">Trip completed</p>
                    <h2 className="text-3xl font-bold">R153.00</h2>
                    <p className="text-xs text-red-200 mt-1">2.4 km • 12 mins</p>
                  </div>
                  <div className="flex-1 px-5 py-5 space-y-4">
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                      {[["Base fare", "R54.00"], ["Distance (2.4km)", "R64.80"], ["Time (12 min)", "R21.60"], ["Service fee", "R12.60"]].map(([label, val]) => (
                        <div key={label} className="flex justify-between text-xs text-gray-600">
                          <span>{label}</span><span>{val}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold text-gray-800">
                        <span>Total</span><span>R153.00</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Pay with</p>
                      {["Credit Card •••• 4242", "Cash", "Panda Wallet (R360.00)"].map((m, i) => (
                        <button key={i} className={`w-full flex items-center gap-3 p-3 rounded-xl border text-xs font-medium ${i === 0 ? "border-red-600 bg-red-50 text-red-600" : "border-gray-200 text-gray-600"}`}>
                          <div className={`w-4 h-4 rounded-full border-2 ${i === 0 ? "border-red-600 bg-red-600" : "border-gray-300"} flex items-center justify-center`}>
                            {i === 0 && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          {m}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setScreen("rating")}
                      className="w-full py-3 bg-red-600 text-white rounded-2xl text-sm font-semibold"
                    >
                      Confirm Payment
                    </button>
                  </div>
                </div>
              )}

              {/* RATING SCREEN */}
              {screen === "rating" && (
                <div className="h-full flex flex-col items-center justify-center bg-white px-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mb-4">🐼</div>
                  <h2 className="text-lg font-bold text-gray-800 mb-1">Payment Successful!</h2>
                  <p className="text-sm text-gray-500 mb-6">How was your trip with David?</p>
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setRating(s)} className={`text-3xl transition-transform ${s <= rating ? "text-yellow-400 scale-110" : "text-gray-200"}`}>★</button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {["Clean car", "Good music", "Friendly", "Safe driving", "On time"].map((tag) => (
                      <button key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{tag}</button>
                    ))}
                  </div>
                  <button
                    onClick={() => { setScreen("home"); setRating(0); }}
                    className="w-full py-3 bg-red-600 text-white rounded-2xl text-sm font-semibold"
                  >
                    Submit & Done
                  </button>
                </div>
              )}
            </div>

            {/* Home indicator */}
            <div className="bg-black h-6 flex items-center justify-center">
              <div className="w-24 h-1 bg-gray-600 rounded-full" />
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="flex-1 max-w-sm space-y-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-balance">Panda Rider</h1>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">Customer-facing mobile app for booking rides, food delivery, and courier services with real-time tracking.</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">App Screens</p>
            <div className="grid grid-cols-2 gap-2">
              {([["home", "Home & Map"], ["booking", "Booking"], ["searching", "Finding Driver"], ["tracking", "Live Tracking"], ["payment", "Payment"], ["rating", "Rate Trip"]] as [Screen, string][]).map(([s, label]) => (
                <button
                  key={s}
                  onClick={() => setScreen(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors ${screen === s ? "bg-red-600 text-white" : "bg-white text-gray-700 border border-gray-200 hover:border-red-300"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Features</p>
            {["Multi-service booking (Ride, Food, Courier)", "Real-time GPS driver tracking", "Multiple payment methods", "In-app chat & calling", "Rating & review system", "Trip history & receipts"].map((f) => (
              <div key={f} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                </div>
                <p className="text-xs text-gray-600">{f}</p>
              </div>
            ))}
          </div>
          <Link href="/driver" className="block w-full py-3 bg-gray-900 text-white rounded-2xl text-sm font-semibold text-center">
            View Driver App →
          </Link>
        </div>
      </div>
    </div>
  );
}
