"use client";

import React, { useEffect, useState } from "react";
import { useOrders } from "@/store/hooks/useOrder";
import OrderCard from "@/components/global/billing/OrderCard";
import Loading from "@/components/loading";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FILTERS = [
  { label: "Today", value: "today" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "All", value: "all" },
];

export default function OrdersPage() {
  const { orders, loading, loadOrders } = useOrders();
  const [selectedFilter, setSelectedFilter] = useState("today");

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = React.useMemo(() => {
    if (!orders) return [];

    if (selectedFilter === "all") return orders;

    if (selectedFilter === "pending")
      return orders.filter((o) => o.paymentStatus === "pending");

    if (selectedFilter === "completed")
      return orders.filter((o) => o.paymentStatus === "paid");

    if (selectedFilter === "today") {
      const today = new Date().toDateString();
      return orders.filter(
        (o) => new Date(o.createdAt).toDateString() === today
      );
    }

    return orders;
  }, [orders, selectedFilter]);

  if (loading) return <Loading />;

  if (!orders || orders.length === 0) return <EmptyState />;

  return (
    <div className="h-full flex flex-col p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-semibold tracking-wide">
          Orders
        </h2>

        <Button
          variant="outline"
          className="text-sm"
          onClick={() => loadOrders()}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto py-1">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            onClick={() => setSelectedFilter(f.value)}
            className={cn(
              "text-sm rounded-full px-4",
              selectedFilter === f.value
                ? "bg-black text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            )}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-2 mb-4">
        Showing {filteredOrders.length} orders
      </p>

      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center mt-14">
          <EmptyState title="No results found for selected filter." />
        </div>
      ) : (
        <div
          className="
            grid grid-cols-1 
            sm:grid-cols-2 lg:grid-cols-3 
             gap-5
            pb-28
          "
        >
          {filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
