"use client";

import React from "react";
import { useDashboard } from "@/store/hooks/useDashboard";
import { Package, TrendingUp, AlertTriangle } from "lucide-react";

export default function ProductStats({ range }) {
  const startDate = range?.startDate;
  const endDate = range?.endDate;

  const {
    topSellingProducts = [],
    lowStockProducts = [],
    loading,
    error,
  } = useDashboard({ startDate, endDate });

  if (loading) {
    return (
      <div className="w-full py-10 flex justify-center">
        <p className="text-gray-500 animate-pulse">Loading product stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-10 flex justify-center">
        <p className="text-red-500">Error loading products: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* TOP SELLING PRODUCTS */}
      <div className="bg-white shadow-md rounded-xl p-5 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-green-600" />
          <h2 className="text-lg font-semibold text-gray-700">
            Top Selling Products
          </h2>
        </div>

        {topSellingProducts.length === 0 ? (
          <p className="text-gray-500 text-sm py-2">No sales yet</p>
        ) : (
          <div className="space-y-4">
            {topSellingProducts.map((product) => (
              <div
                key={product._id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 relative rounded-lg overflow-hidden border">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex justify-center items-center bg-gray-100">
                        <Package size={18} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {product.title}
                    </p>
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-base font-semibold text-green-600">
                    {product.totalSold}
                  </p>
                  <p className="text-[11px] text-gray-400">sold</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LOW STOCK PRODUCTS */}
      <div className="bg-white shadow-md rounded-xl p-5 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={20} className="text-red-500" />
          <h2 className="text-lg font-semibold text-gray-700">
            Low Stock Products
          </h2>
        </div>

        {lowStockProducts.length === 0 ? (
          <p className="text-gray-500 text-sm py-2">
            Everything is well stocked 🎉
          </p>
        ) : (
          <div className="space-y-4">
            {lowStockProducts.map((product) => (
              <div
                key={product._id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 relative rounded-lg overflow-hidden border">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex justify-center items-center bg-gray-100">
                        <Package size={18} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {product.title}
                    </p>
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-base font-semibold text-red-500">
                    {product.stock}
                  </p>
                  <p className="text-[11px] text-gray-400">left</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
