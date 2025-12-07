"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  IndianRupee,
  ShoppingBag,
  Smartphone,
  User2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import BillPrintView from "../bill";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import PaymentQRSection from "../payment/PaymentQrSection";

export default function OrderBeautifulCard({ order }) {
  const [showAllItems, setShowAllItems] = useState(false);
  const router = useRouter();

  const goToPay = () => router.push(`/payment/${order._id}`);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    completed: "bg-green-100 text-green-700 border border-green-200",
    cancelled: "bg-red-100 text-red-700 border border-red-200",
  };

  const paymentColors = {
    pending: "bg-orange-100 text-orange-700 border border-orange-200",
    paid: "bg-green-100 text-green-700 border border-green-200",
    failed: "bg-red-100 text-red-700 border border-red-200",
  };

  const formattedDate = new Date(order.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Card className="p-5 hover:shadow-xl transition-all duration-200 bg-white border border-gray-200 rounded-2xl">
      {/* -------- Header ---------- */}
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-lg font-semibold leading-none">
          Order #{order._id?.slice(-6)}
        </h2>

        <div className="flex gap-2">
          <Badge className={statusColors[order.status] || ""}>
            {order.status?.toUpperCase()}
          </Badge>

          <Badge className={paymentColors[order.paymentStatus] || ""}>
            {order.paymentStatus?.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* -------- Customer Details ---------- */}
      <div className="space-y-1 text-sm text-gray-700 mt-4 pb-3 border-b">
        <div className="flex items-center gap-2">
          <User2 size={16} className="text-gray-500" />
          <span className="font-medium">{order.customerId?.name || "--"}</span>
        </div>

        <div className="flex items-center gap-2">
          <Smartphone size={16} className="text-gray-500" />
          <span>{order.customerId?.phone || "--"}</span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-500" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* -------- Order summary ---------- */}
      <div className="flex justify-between mt-4 text-sm">
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-gray-600" />
          <span>{order.items?.length} Items</span>
        </div>

        <div className="flex items-center gap-1 font-bold text-green-700">
          <IndianRupee size={18} />
          <span>{order.total}</span>
        </div>
      </div>

      {/* -------- Items List ---------- */}
      <div className="mt-3 text-sm text-gray-700 bg-gray-50 rounded-lg p-3 transition-all">
        {(showAllItems ? order.items : order.items?.slice(0, 2))?.map(
          (item, index) => (
            <div
              key={index}
              className="flex justify-between py-1 border-b last:border-none"
            >
              <span className="truncate">{item.name}</span>
              <span>x{item.quantity}</span>
            </div>
          )
        )}

        {order.items?.length > 2 && (
          <button
            onClick={() => setShowAllItems((prev) => !prev)}
            className="w-full mt-2 flex items-center justify-center gap-1 text-blue-600 text-xs pt-1"
          >
            {showAllItems ? "Hide Items" : "View All Items"}
            {showAllItems ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        )}
      </div>

      {/* -------- Footer Actions ---------- */}
      <div className="flex gap-2 mt-5">
        {/* View Bill */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex-1">View Bill</Button>
          </DialogTrigger>
          <DialogContent>
            <BillPrintView order={order} />
          </DialogContent>
        </Dialog>

        {order.paymentStatus === "pending" && (
          <PaymentQRSection order={order} />
        )}
      </div>
    </Card>
  );
}
