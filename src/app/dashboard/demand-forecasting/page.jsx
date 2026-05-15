"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  CloudSun,
  ShoppingBag,
  Zap,
  Info,
  ArrowUpRight,
  BarChart3,
  Waves,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
  Search,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  ReferenceLine
} from "recharts";
import { useAuth, useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const COLORS = ["#000000", "#4B5563", "#9CA3AF", "#D1D5DB", "#F3F4F6"];

export default function DemandForecastingDashboard() {
  const router = useRouter();
  const { isLoaded } = useAuth();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const lat = 28.6139;
        const lon = 77.2090;
        
        // 1. Weather Data
        const weatherRes = await fetch(`/api/forecasting/weather/realtime?lat=${lat}&lon=${lon}`);
        const weatherData = await weatherRes.json();
        setWeather(weatherData);

        const payload = {
          forecast_features: weatherData?.current?.condition?.text ? [weatherData.current.condition.text] : [],
          orgId: organization?.id
        };

        // 2. Parallel Fetch for divided APIs
        const [compRes, healthRes, marketRes, trendsRes] = await Promise.all([
          fetch("/api/forecasting/comprehensive", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }),
          fetch("/api/forecasting/inventory-health", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }),
          fetch(`/api/forecasting/market-intelligence?orgId=${organization?.id || ""}`),
          fetch("/api/forecasting/shop-trends", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          })
        ]);

        const compData = await compRes.json();
        const healthData = await healthRes.json();
        const marketData = await marketRes.json();
        const trendsData = await trendsRes.json();

        // Merge for UI compatibility
        setData({
          ...compData,
          ...healthData,
          ...marketData,
          ...trendsData
        });

      } catch (error) {
        console.error("Error fetching forecasting data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded) {
      fetchData();
    }
  }, [isLoaded, organization]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">Calculating Predictions...</span>
        </div>
      </div>
    );
  }

  const signals = data?.summary?.active_signals || [];
  const projections = data?.projections;

  return (
    <div className="min-h-screen bg-gray-50 text-black p-2 md:p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[
          { label: "Tomorrow", val: projections?.tomorrow?.val, icon: Calendar, trend: projections?.tomorrow?.growth, desc: "AI Prediction" },
          { label: "Next 7 Days", val: projections?.next_7_days?.val, icon: TrendingUp, trend: projections?.next_7_days?.growth, desc: "Projected Volume" },
          { label: "Next 15 Days", val: Math.round((projections?.next_30_days?.val || 0) / 2), icon: BarChart3, trend: projections?.next_30_days?.growth, desc: "Interpolated" },
          { label: "Next 30 Days", val: projections?.next_30_days?.val, icon: Sparkles, trend: projections?.next_30_days?.growth, desc: "Full Monthly Outlook" }
        ].map((proj, i) => (
          <div key={i} className="group relative overflow-hidden bg-white border border-gray-200 p-4 rounded-[2rem] hover:border-black transition-all shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-black group-hover:text-white transition-colors">
                <proj.icon size={24} />
              </div>
              <span className={cn(
                "text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter",
                proj.trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              )}>
                {proj.trend >= 0 ? "+" : ""}{proj.trend}%
              </span>
            </div>
            <div className="text-4xl font-black tracking-tighter mb-1">₹{proj.val?.toLocaleString()}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{proj.label}</div>
            <div className="text-[9px] text-gray-300 font-medium mt-4 uppercase tracking-wider">{proj.desc}</div>
          </div>
        ))}
      </div>

      <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <BarChart3 size={22} />
              Actual vs Predicted Sales
            </h3>
            <p className="text-xs text-gray-400 mt-1 font-medium">Comparison of real sales performance against model predictions.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-black"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Predicted</span>
            </div>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.chart_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                fontSize={10}
                fontWeight="700"
                axisLine={false}
                tickLine={false}
                tickFormatter={(str) => {
                  const date = new Date(str);
                  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelFormatter={(label) => new Date(label).toDateString()}
              />
              <ReferenceLine x={new Date().toISOString().split('T')[0]} stroke="#000" strokeDasharray="3 3" label={{ value: "TODAY", position: "insideTopRight", fill: "#9ca3af", fontSize: 10, fontWeight: "900" }} />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#000000"
                strokeWidth={3}
                dot={{ r: 4, fill: "#000" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Layers size={22} />
                  Inventory Health Matrix
                </h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">Correlation between demand score and current stock availability.</p>
              </div>
              <span className="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-full uppercase tracking-tighter">Action Required</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Stock</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Demand Score</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
                    <th className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.inventory_health?.map((item, idx) => (
                    <tr
                      key={idx}
                      className="group hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/demand-forecasting/product/${item.id}`)}
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-[10px] font-black group-hover:bg-black group-hover:text-white transition-all overflow-hidden border border-gray-100">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              item.name.charAt(0)
                            )}
                          </div>
                          <span className="text-xs font-black uppercase tracking-tight">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <span className="text-xs font-bold">{item.stock}</span>
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-black rounded-full" style={{ width: `${item.demand}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400">{item.demand}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <span className={cn(
                          "px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter",
                          item.status === "CRITICAL" ? "bg-red-100 text-red-600" :
                            item.status === "WARNING" ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"
                        )}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-black transition-colors ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>


        </div>

        {/* RIGHT COLUMN: Global Trends & Signals */}
        <div className="xl:col-span-4 space-y-8">

          {/* Current Strategy Radar */}
          <section className="bg-black text-white rounded-3xl p-8 shadow-xl">
            <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap size={20} className="text-yellow-400" />
              Environment Pulse
            </h3>
            <div className="space-y-4">
              {signals.map((signal) => (
                <div key={signal} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0">
                  <span className="text-xs font-bold uppercase tracking-widest">{signal.replace("_", " ")}</span>
                  <CheckCircle2 size={16} className="text-emerald-400" />
                </div>
              ))}
            </div>
            <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-xs font-medium text-gray-400 leading-relaxed uppercase tracking-wider">
                Predictions are adjusted for <span className="text-white font-bold">{signals.length} active environmental signals</span> detected in your local zone.
              </p>
            </div>
          </section>

          {/* Network Velocity */}
          <section className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <ShoppingBag size={20} className="text-blue-600" />
                Other Shops Trend
              </h3>
            </div>

            <div className="space-y-6">
              {data?.trending_globally?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group py-1">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black text-gray-100 group-hover:text-black transition-colors w-6">{idx + 1}</span>
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 group-hover:border-black transition-all">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-black">{item.productName.charAt(0)}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase tracking-tight line-clamp-1 max-w-[150px]">{item.productName}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">{item.totalQuantity} Units Sold</div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gray-200 group-hover:text-black transition-all" />
                </div>
              ))}
            </div>

            <div className="mt-10 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
              <p className="text-[10px] text-gray-400 leading-relaxed italic uppercase font-bold tracking-widest">
                Real network data from 150+ locations.
              </p>
            </div>
          </section>

        </div>
      </div>

      {/* Market Pulse: Competitor Trends (FULL WIDTH SCROLLABLE) */}
      <section className="bg-white border border-gray-200 rounded-[3rem] p-12 shadow-sm mt-12 overflow-hidden">
        <div className="flex items-center justify-between mb-12 px-2">
          <div>
            <h3 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
              <TrendingUp size={32} className="text-blue-500" />
              Market Intelligence: Neighbor Network
            </h3>
            <p className="text-[10px] text-gray-400 mt-2 font-black uppercase tracking-[0.3em]">Real-time item velocity across 5 neighboring retailers (Anonymized).</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Network Sync</span>
          </div>
        </div>

        <div className="space-y-16">
          {data?.competitor_leaderboard?.map((comp, idx) => (
            <div key={idx} className="relative group">
              {/* Shop Header */}
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-white font-black text-xl shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight text-gray-400 blur-[2px] group-hover:blur-0 transition-all duration-500">Shop {comp.city || "Neighbor"} Location</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full uppercase tracking-tighter border border-blue-100">Market Leader</span>
                      <span className="text-[9px] font-bold text-gray-300 uppercase">3.2km Away</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black tracking-tighter">+12%</div>
                  <div className="text-[8px] font-black text-gray-300 uppercase tracking-widest">MoM Growth</div>
                </div>
              </div>

              {/* Scrollable Products Row */}
              <div className="relative">
                <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x px-2">
                  {comp.topItems.map((item, i) => (
                    <div key={i} className="flex-shrink-0 w-64 snap-start group/card relative">
                      <div className="bg-white border border-gray-100 rounded-[2rem] p-5 hover:border-black transition-all shadow-sm hover:shadow-2xl flex flex-col gap-4">
                        {/* Product Image Container */}
                        <div className="aspect-square rounded-3xl bg-gray-50 overflow-hidden border border-gray-50 relative group-hover/card:scale-[1.02] transition-transform duration-500">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-gray-50 to-gray-100">
                              <Package size={32} className="text-gray-200" />
                              <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest text-center px-4">{item.name}</span>
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md border border-gray-100 px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <span className="text-[9px] font-black text-blue-600">#{i + 1}</span>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-1">
                          <h5 className="text-xs font-black uppercase tracking-tight line-clamp-1">{item.name}</h5>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-blue-500">+{item.sales} Units</span>
                              <span className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">7 Day Velocity</span>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-xl group-hover/card:bg-black group-hover/card:text-white transition-colors">
                              <ArrowUpRight size={14} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Horizontal Fade Overlays */}
                <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                <div className="absolute top-0 left-0 h-full w-4 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
              </div>
            </div>
          ))}

          {(!data?.competitor_leaderboard || data.competitor_leaderboard.length === 0) && (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
              <div className="relative inline-block mb-6">
                <Search size={64} className="text-gray-100" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-sm font-black text-gray-300 uppercase italic tracking-[0.4em]">Aggregating Regional Demand Signals...</p>
            </div>
          )}
        </div>
      </section>


      </div>
  );
}
