"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { usePayment } from "@/store/hooks/usePayment";
import { useOrganization } from "@clerk/nextjs";
import React from "react";

export default function PaymentQRSection({ order }) {
  const { qr, status, error, generatePayment, resetPayment } = usePayment();
  const { organization } = useOrganization();

  const customerName = order.customerId?.name || "Walk-in Customer";
  const customerPhone = order.customerId?.phone || "919311507651";

  return (
    <div className="space-y-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            onClick={() => {
              const paymentAmount = Number(order.total) || 300;

              generatePayment({
                name: customerName,
                phone: customerPhone,
                payment_amount: Math.floor(paymentAmount),
                close_by: Math.floor(Date.now() / 1000) + 2 * 24 * 3600,
                notes: {
                  orderId: order._id,
                  purpose: `Payment for Order #${order._id?.slice(-6)}`,
                  customerName,
                },
                description: `Payment for Order #${order._id?.slice(-6)}`,
              });
            }}
            disabled={status === "loading"}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            {status === "loading"
              ? "Generating..."
              : qr
              ? "View QR"
              : "Generate QR"}
          </Button>
        </DialogTrigger>

        {qr && (
          <DialogContent>
            <div className="flex flex-col items-center border p-3 rounded gap-2">
              <p className="text-sm font-medium text-green-600">
                Payment QR Generated
              </p>

              <img
                src={qr.image_url}
                alt="QR Code"
                width={200}
                height={200}
                className="border rounded-md"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={resetPayment}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Reset
              </Button>
            </div>
            {error && !qr && (
              <p className="text-red-500 text-sm text-center">
                {error?.message || "Something went wrong"}
              </p>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
