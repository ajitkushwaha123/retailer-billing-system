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
  LinkIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import BillPrintView from "../bill";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import PaymentQRSection from "../payment/PaymentQrSection";
import { usePayment } from "@/store/hooks/usePayment";
import { useOrganization } from "@clerk/nextjs";

export default function OrderBeautifulCard({ order }) {
  const [showAllItems, setShowAllItems] = useState(false);
  const router = useRouter();
  const { organization } = useOrganization();

  const { sendReminder, reminderStatus, generatePaymentLink, status } =
    usePayment();

  const formattedDate = new Date(order.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handleReminderSend = () => {
    sendReminder({
      phone: order.customerId?.phone,
      customerName: order.customerId?.name,
      amount: order.total,
      dueDate: order.createdAt,
      storeName: organization?.name || "Our Store",
    });
  };

  const handleGenerateLink = () => {
    generatePaymentLink({
      name: order.customerId?.name,
      phone: order.customerId?.phone,
      amount: order.total,
      orderId: order._id,
    });
  };

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

  return (
    <Card className="p-5 hover:shadow-xl transition-all duration-200 bg-white border border-gray-200 rounded-2xl">
      {/* HEADER */}
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

      {/* CUSTOMER INFO */}
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

      {/* ORDER SUMMARY */}
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

      {/* ITEMS LIST */}
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

      {/* ACTION BUTTONS */}
      <div className="flex gap-2 mt-5 flex-col md:flex-row">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex-1">View Bill</Button>
          </DialogTrigger>
          <DialogContent>
            <BillPrintView order={order} />
          </DialogContent>
        </Dialog>

        {/* PAYMENT ACTIONS */}
        {order.paymentStatus === "pending" && (
          <>
            {/* Show generate link first */}
            {!order.paymentLink || order.paymentLink === "" ? (
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleGenerateLink}
                disabled={status === "loading"}
              >
                {status === "loading"
                  ? "Generating..."
                  : "Generate Payment Link"}
              </Button>
            ) : (
              <Button
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                disabled={reminderStatus === "loading"}
                onClick={handleReminderSend}
              >
                {reminderStatus === "loading"
                  ? "Sending..."
                  : reminderStatus === "success"
                  ? "Reminder Sent ✓"
                  : "Send Payment Reminder"}
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
