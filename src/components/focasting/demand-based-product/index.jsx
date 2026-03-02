"use client";

import React, { useEffect, useState } from "react";
import { Flame, TrendingUp, ArrowDown, Package, CloudOff } from "lucide-react";

export default function DemandProductStats({
  weather,
  loading: parentLoading,
  error: parentError,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!weather) return;

    const fetchDemandProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/forecasting/product/demand/weather`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(weather),
        });

        if (!res.ok) {
          throw new Error("Demand engine failed");
        }

        const demandData = await res.json();
        setData(demandData);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDemandProducts();
  }, [weather]);

  if (parentLoading || loading) {
    return (
      <div className="w-full py-10 flex justify-center">
        <p className="text-gray-500 animate-pulse">Loading demand forecast...</p>
      </div>
    );
  }

  if (parentError || error) {
    return (
      <div className="w-full py-12 flex flex-col items-center text-center border rounded-xl bg-white">
        <CloudOff size={36} className="text-red-500 mb-3" />
        <p className="text-sm font-medium text-gray-700">Failed to load demand forecast</p>
        <p className="text-xs text-gray-500 mt-1">{parentError || error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DemandCard
        title="High Demand"
        icon={<Flame className="text-green-500" size={20} />}
        items={data.high_demand.slice(0, 5)}
        emptyText="No high demand products today"
      />

      <DemandCard
        title="Medium Demand"
        icon={<TrendingUp className="text-yellow-500" size={20} />}
        items={data.medium_demand.slice(0, 5)}
        emptyText="No medium demand products"
      />
    </div>
  );
}

function DemandCard({ title, icon, items, emptyText }) {
  console.log("ties" , items)
  return (
    <div className="bg-white shadow-sm rounded-xl p-5 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">{emptyText}</div>
      ) : (
        <div className="space-y-4">
          {items.map((product) => (
            <div
              key={product._id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden border">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Package size={18} className="text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <p className="text-sm font-medium text-gray-700">{product.title}</p>
                  <p className="text-xs text-gray-500">{product.category}</p>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.stock !== undefined && product.stock < 5 && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-700">
                        Low Stock
                      </span>
                    )}
                    {product.demand_level && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded ${
                          product.demand_level === "HIGH"
                            ? "bg-green-100 text-green-700"
                            : product.demand_level === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {product.demand_level} Demand
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">{product.demand_score}</p>
                <p className="text-[11px] text-gray-400">score</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}