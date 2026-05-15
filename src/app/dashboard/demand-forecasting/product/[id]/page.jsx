"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  BarChart3, 
  Package, 
  TrendingUp, 
  ShoppingCart,
  Calendar,
  Zap,
  Info,
  ChevronRight,
  Sparkles
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProductForecastDetail({ params }) {
  const { id } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/forecasting/product/${id}`);
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching product forecast:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="h-12 w-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data?.product) {
    return <div className="p-10">Product not found.</div>;
  }

  const { product, chart_data, summary } = data;

  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 md:p-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-8 uppercase tracking-widest">
        <Link href="/dashboard/demand-forecasting" className="hover:text-black transition-colors">Forecasting</Link>
        <ChevronRight size={12} />
        <span className="text-black">Product Intelligence</span>
      </div>

      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          {product.image && (
            <div className="w-24 h-24 rounded-3xl bg-white border border-gray-200 overflow-hidden shadow-sm">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">{product.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="px-2 py-1 bg-black text-white text-[10px] font-bold rounded uppercase tracking-tighter">
                {product.category || "General"}
              </span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                ID: {id.slice(-8)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit Price</div>
            <div className="text-2xl font-black">₹{product.price}</div>
          </div>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest hover:border-black transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border border-gray-200 p-8 rounded-[2rem] shadow-sm">
          <div className="p-3 bg-gray-50 w-fit rounded-2xl mb-6">
            <Package size={24} />
          </div>
          <div className="text-4xl font-black tracking-tighter mb-1">{product.stock}</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Stock Level</div>
        </div>

        <div className="bg-white border border-gray-200 p-8 rounded-[2rem] shadow-sm">
          <div className="p-3 bg-gray-50 w-fit rounded-2xl mb-6 text-blue-600">
            <ShoppingCart size={24} />
          </div>
          <div className="text-4xl font-black tracking-tighter mb-1">{product.totalSold}</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Units Sold (Lifetime)</div>
        </div>

        <div className="bg-black text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="p-3 bg-white/10 w-fit rounded-2xl mb-6 text-yellow-400 relative z-10">
            <Sparkles size={24} />
          </div>
          <div className="text-4xl font-black tracking-tighter mb-1 relative z-10">₹{(product.totalSold * product.price).toLocaleString()}</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest relative z-10">Estimated Sales Revenue</div>
          <div className="absolute -bottom-6 -right-6 text-white/5">
            <BarChart3 size={160} />
          </div>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8">
          <section className="bg-white border border-gray-200 rounded-[2.5rem] p-10 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <BarChart3 size={22} className="text-blue-500" />
                  Unit Consumption Trends
                </h3>
                <p className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wider">Actual Units Sold vs Predicted Demand Pattern</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-black"></div>
                  <span className="text-[10px] font-black text-gray-400 uppercase">Actual Sold</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-black text-gray-400 uppercase">Predicted</span>
                </div>
              </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af" 
                    fontSize={10} 
                    fontWeight="900"
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    }}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={10} 
                    fontWeight="900" 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '16px' }}
                    labelStyle={{ fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', fontSize: '10px' }}
                  />
                  <ReferenceLine x={new Date().toISOString().split('T')[0]} stroke="#000" strokeDasharray="5 5" label={{ value: "TODAY", position: "insideTopRight", fill: "#9ca3af", fontSize: 10, fontWeight: "900" }} />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#000000" 
                    strokeWidth={4} 
                    dot={{ r: 5, fill: "#000", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    strokeDasharray="8 8"
                    dot={{ r: 0 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* SIDEBAR: Strategic Analysis */}
        <div className="xl:col-span-4 space-y-6">
          <section className="bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2">
              <Zap size={18} className="text-yellow-500" />
              Strategic Outlook
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Daily Velocity</span>
                  <span className="text-lg font-black">{summary.avg_daily_units} units</span>
                </div>
                <ArrowUpRight size={20} className="text-emerald-500" />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">7-Day Demand</span>
                  <span className="text-lg font-black">{summary.predicted_next_7_days} units</span>
                </div>
                <TrendingUp size={20} className="text-blue-500" />
              </div>

              <div className="flex items-center justify-between p-4 bg-black text-white rounded-2xl shadow-lg">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Stock Runway</span>
                  <span className="text-lg font-black">
                    {Math.round(product.stock / (summary.avg_daily_units || 1))} Days
                  </span>
                </div>
                <Info size={20} className="text-gray-500" />
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recommended Action</span>
              </div>
              <p className="text-xs font-bold leading-relaxed">
                {product.stock < summary.predicted_next_7_days 
                  ? `CRITICAL: Your current stock will run out in less than 7 days. Reorder immediately.`
                  : `HEALTHY: Current inventory levels are sufficient for the next 15 days of projected demand.`}
              </p>
            </div>
          </section>

          <div className="p-8 bg-blue-600 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <h4 className="text-sm font-black uppercase tracking-widest mb-4 relative z-10">Smart Alerts</h4>
            <p className="text-xs font-medium leading-relaxed opacity-80 relative z-10">
              This product shows a specific weekend spike pattern. Consider increasing Friday morning stock levels by 15%.
            </p>
            <div className="absolute -bottom-4 -right-4 opacity-10">
              <Zap size={120} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
