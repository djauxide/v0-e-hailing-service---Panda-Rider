"use client";

import { useState } from "react";
import Link from "next/link";

const SCREENS = ["home", "booking", "searching", "tracking", "payment", "rating", "wallet", "send", "login", "register", "security"] as const;
type Screen = typeof SCREENS[number];

export default function RiderApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [serviceType, setServiceType] = useState<"ride" | "food" | "courier">("ride");
  const [rating, setRating] = useState(0);
  const [sendAmount, setSendAmount] = useState("");
  const [sendPhone, setSendPhone] = useState("");
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.2);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [useBiometric, setUseBiometric] = useState(false);
  const walletBalance = 2150.00;

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
                    {/* Wallet Quick Access */}
                    <button 
                      onClick={() => setScreen("wallet")}
                      className="w-full mb-3 p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">R</span>
                        </div>
                        <div className="text-left">
                          <p className="text-white/80 text-xs">Panda Wallet</p>
                          <p className="text-white font-bold text-sm">R{walletBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                      <span className="text-white/80 text-xs">Tap to manage</span>
                    </button>
                    
                    {/* P2P Quick Actions */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button 
                        onClick={() => setScreen("send")}
                        className="p-2.5 bg-blue-500 rounded-xl flex items-center justify-center gap-2"
                      >
                        <span className="text-white text-sm">Send Money</span>
                      </button>
                      <button 
                        onClick={() => setScreen("wallet")}
                        className="p-2.5 bg-purple-500 rounded-xl flex items-center justify-center gap-2"
                      >
                        <span className="text-white text-sm">Request</span>
                      </button>
                    </div>

                    {/* Surge Indicator */}
                    {surgeMultiplier > 1 && (
                      <div className="mb-3 p-2.5 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{surgeMultiplier}x</span>
                          </div>
                          <div>
                            <p className="text-orange-800 text-xs font-semibold">Surge Pricing Active</p>
                            <p className="text-orange-600 text-xs">High demand in your area</p>
                          </div>
                        </div>
                        <button className="text-orange-600 text-xs underline">Why?</button>
                      </div>
                    )}
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

              {/* WALLET SCREEN */}
              {screen === "wallet" && (
                <div className="h-full flex flex-col bg-gray-900">
                  <div className="px-5 pt-10 pb-6">
                    <button onClick={() => setScreen("home")} className="text-white/60 text-xs mb-4 flex items-center gap-1">
                      ← Back
                    </button>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-5">
                      <p className="text-green-100 text-xs mb-1">Available Balance</p>
                      <h2 className="text-3xl font-bold text-white mb-1">R{walletBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</h2>
                      <p className="text-green-200 text-xs">Panda Wallet</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-white rounded-t-3xl px-5 pt-5 pb-6 overflow-y-auto">
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {[
                        { label: "Send", icon: "↑", color: "bg-blue-500", action: () => setScreen("send") },
                        { label: "Request", icon: "↓", color: "bg-green-500", action: () => {} },
                        { label: "Top Up", icon: "+", color: "bg-purple-500", action: () => {} },
                        { label: "Withdraw", icon: "→", color: "bg-orange-500", action: () => {} },
                      ].map((item) => (
                        <button key={item.label} onClick={item.action} className="flex flex-col items-center gap-1">
                          <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-white font-bold`}>
                            {item.icon}
                          </div>
                          <span className="text-xs text-gray-600">{item.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-gray-500 mb-3">Recent Transactions</p>
                    <div className="space-y-3">
                      {[
                        { desc: "From Thabo M.", amount: "+R500.00", time: "Today, 14:32", type: "in" },
                        { desc: "Trip Payment", amount: "-R153.00", time: "Today, 12:15", type: "out" },
                        { desc: "Wallet Top-up", amount: "+R1,000.00", time: "Yesterday", type: "in" },
                        { desc: "To Naledi K.", amount: "-R250.00", time: "2 days ago", type: "out" },
                      ].map((tx, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === "in" ? "bg-green-100" : "bg-red-100"}`}>
                            <span className={tx.type === "in" ? "text-green-600" : "text-red-600"}>{tx.type === "in" ? "↓" : "↑"}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{tx.desc}</p>
                            <p className="text-xs text-gray-400">{tx.time}</p>
                          </div>
                          <span className={`font-semibold text-sm ${tx.type === "in" ? "text-green-600" : "text-gray-800"}`}>{tx.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SEND MONEY SCREEN */}
              {screen === "send" && (
                <div className="h-full flex flex-col bg-white">
                  <div className="bg-blue-600 px-5 pt-10 pb-6 text-white">
                    <button onClick={() => setScreen("wallet")} className="text-white/80 text-xs mb-3 flex items-center gap-1">
                      ← Back
                    </button>
                    <h2 className="text-lg font-bold">Send Money</h2>
                    <p className="text-xs text-blue-200 mt-1">Instant transfers to any Panda user</p>
                  </div>
                  <div className="flex-1 px-5 py-5 space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Recipient Phone</label>
                      <input
                        type="tel"
                        value={sendPhone}
                        onChange={(e) => setSendPhone(e.target.value)}
                        placeholder="+27 XX XXX XXXX"
                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Amount (ZAR)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">R</span>
                        <input
                          type="number"
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-gray-50 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[100, 250, 500].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setSendAmount(amt.toString())}
                          className="py-2 bg-gray-100 rounded-xl text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                        >
                          R{amt}
                        </button>
                      ))}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Transfer fee (1%)</span>
                        <span>R{sendAmount ? (parseFloat(sendAmount) * 0.01).toFixed(2) : "0.00"}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-gray-800">
                        <span>Total</span>
                        <span>R{sendAmount ? (parseFloat(sendAmount) * 1.01).toFixed(2) : "0.00"}</span>
                      </div>
                    </div>
                    <button className="w-full py-3 bg-blue-600 text-white rounded-2xl text-sm font-semibold">
                      Send Money
                    </button>
                    <p className="text-center text-xs text-gray-400">Recipient will receive a WhatsApp notification</p>
                  </div>
                </div>
              )}

              {/* LOGIN SCREEN */}
              {screen === "login" && (
                <div className="h-full flex flex-col bg-white">
                  <div className="bg-red-600 px-5 pt-12 pb-8 text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center mb-3">
                      <span className="text-3xl">PR</span>
                    </div>
                    <h2 className="text-white text-xl font-bold">Welcome Back</h2>
                    <p className="text-red-200 text-xs mt-1">Sign in to continue</p>
                  </div>
                  <div className="flex-1 px-5 py-5 space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Email or Phone</label>
                      <input
                        type="text"
                        placeholder="Enter email or phone"
                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Password</label>
                      <input
                        type="password"
                        placeholder="Enter password"
                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <button className="text-xs text-red-600 text-right w-full">Forgot Password?</button>
                    <button 
                      onClick={() => setScreen("home")}
                      className="w-full py-3 bg-red-600 text-white rounded-2xl text-sm font-semibold"
                    >
                      Sign In
                    </button>
                    
                    {/* Biometric Login */}
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-3">Or sign in with</p>
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => setScreen("home")}
                          className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"
                        >
                          <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v3H9V7c0-1.654 1.346-3 3-3zm0 10c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2z"/>
                          </svg>
                        </button>
                        <button 
                          onClick={() => setScreen("home")}
                          className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"
                        >
                          <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            <rect x="3" y="11" width="18" height="11" rx="2"/>
                            <circle cx="12" cy="16" r="1"/>
                          </svg>
                        </button>
                        <button 
                          onClick={() => setScreen("home")}
                          className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"
                        >
                          <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-center text-xs text-gray-500 mt-4">
                      {"Don't have an account? "}
                      <button onClick={() => setScreen("register")} className="text-red-600 font-semibold">Sign Up</button>
                    </p>
                  </div>
                </div>
              )}

              {/* REGISTER SCREEN */}
              {screen === "register" && (
                <div className="h-full flex flex-col bg-white overflow-y-auto">
                  <div className="bg-red-600 px-5 pt-10 pb-6">
                    <button onClick={() => setScreen("login")} className="text-white/80 text-xs mb-2">Back</button>
                    <h2 className="text-white text-xl font-bold">Create Account</h2>
                    <p className="text-red-200 text-xs mt-1">Join Panda Rider today</p>
                  </div>
                  <div className="flex-1 px-5 py-4 space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="Enter email address"
                        className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+27 XX XXX XXXX"
                        className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Password</label>
                      <input
                        type="password"
                        placeholder="Create a password"
                        className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="Confirm password"
                        className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    
                    {/* Security Options */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-700">Security Options</p>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4 text-red-600 rounded" />
                        <span className="text-xs text-gray-600">Enable biometric login</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4 text-red-600 rounded" />
                        <span className="text-xs text-gray-600">Enable 2-factor authentication</span>
                      </label>
                    </div>
                    
                    <button 
                      onClick={() => setScreen("home")}
                      className="w-full py-3 bg-red-600 text-white rounded-2xl text-sm font-semibold"
                    >
                      Create Account
                    </button>
                    <p className="text-center text-xs text-gray-400">
                      By signing up, you agree to our Terms & Privacy Policy
                    </p>
                  </div>
                </div>
              )}

              {/* SECURITY SETTINGS SCREEN */}
              {screen === "security" && (
                <div className="h-full flex flex-col bg-gray-50">
                  <div className="bg-gray-900 px-5 pt-10 pb-6">
                    <button onClick={() => setScreen("home")} className="text-white/60 text-xs mb-2">Back</button>
                    <h2 className="text-white text-lg font-bold">Security Settings</h2>
                    <p className="text-gray-400 text-xs mt-1">Manage your account security</p>
                  </div>
                  <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
                    {/* Biometric */}
                    <div className="bg-white rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <span className="text-lg">FID</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Biometric Login</p>
                            <p className="text-xs text-gray-500">Face ID / Fingerprint</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setUseBiometric(!useBiometric)}
                          className={`w-12 h-7 rounded-full transition-colors ${useBiometric ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${useBiometric ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    
                    {/* PIN Setup */}
                    <div className="bg-white rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <span className="text-lg">PIN</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Transaction PIN</p>
                            <p className="text-xs text-gray-500">4-digit security PIN</p>
                          </div>
                        </div>
                        <button className="text-xs text-red-600 font-semibold">Setup</button>
                      </div>
                    </div>
                    
                    {/* 2FA */}
                    <div className="bg-white rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <span className="text-lg">2FA</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Two-Factor Auth</p>
                            <p className="text-xs text-gray-500">SMS / Authenticator</p>
                          </div>
                        </div>
                        <button className="text-xs text-red-600 font-semibold">Enable</button>
                      </div>
                    </div>
                    
                    {/* Active Sessions */}
                    <div className="bg-white rounded-xl p-4">
                      <p className="text-sm font-semibold text-gray-800 mb-3">Active Sessions</p>
                      <div className="space-y-2">
                        {[
                          { device: "iPhone 15 Pro", location: "Johannesburg", current: true },
                          { device: "Chrome - MacBook", location: "Cape Town", current: false },
                        ].map((session, i) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div>
                              <p className="text-xs font-medium text-gray-700">{session.device}</p>
                              <p className="text-xs text-gray-400">{session.location}</p>
                            </div>
                            {session.current ? (
                              <span className="text-xs text-green-600 font-medium">Current</span>
                            ) : (
                              <button className="text-xs text-red-600">Revoke</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <button className="w-full py-3 bg-red-100 text-red-600 rounded-xl text-sm font-semibold">
                      Sign Out All Devices
                    </button>
                  </div>
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
              {([["home", "Home & Map"], ["wallet", "Wallet"], ["send", "Send Money"], ["booking", "Booking"], ["searching", "Finding Driver"], ["tracking", "Live Tracking"], ["payment", "Payment"], ["rating", "Rate Trip"], ["login", "Login"], ["register", "Register"], ["security", "Security"]] as [Screen, string][]).map(([s, label]) => (
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
            {["Multi-service booking (Ride, Food, Courier)", "Real-time GPS driver tracking", "P2P Money Transfers (ZAR)", "Google Pay / Apple Pay", "Biometric & PIN Security", "Surge pricing alerts", "WhatsApp notifications"].map((f) => (
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
