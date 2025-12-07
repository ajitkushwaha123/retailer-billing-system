"use client";
import React, { useEffect } from "react";
import { useOrders } from "@/store/hooks/useOrder";
import { Loader2 } from "lucide-react";
import OrderCard from "@/components/global/billing/OrderCard";

const OrdersPage = () => {
  const { orders, loading, loadOrders } = useOrders();

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );

  if (!orders || orders.length === 0)
    return (
      <div className="text-center py-20 text-gray-500 text-lg">
        No Orders Found 🚫
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Orders</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
