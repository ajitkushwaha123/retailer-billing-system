"use client";

import { useOrganization } from "@clerk/nextjs";
import React from "react";
import QRCode from "react-qr-code";

export default function BillPrintView({ order }) {
  const invoiceDate = new Date(order.createdAt);
  const formattedDate = invoiceDate.toLocaleDateString("en-IN");
  const formattedTime = invoiceDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const { organization } = useOrganization();
  const team = {
    name: organization?.name || "KRAVY FOODS",
    address: "Rajokari, New Delhi - 110001",
    phone: "+91 8178739633",
  };

  const printBill = () => {
    const billContent = document.getElementById("bill-to-print");
    if (!billContent) return;

    const printWindow = window.open("", "_blank", "width=300,height=600");

    const styles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style')
    )
      .map((node) => node.outerHTML)
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          ${styles}
          <style>
            body { font-family: monospace; font-size: 12px; padding: 5px; width: 280px; }
            button { display: none; }
          </style>
        </head>
        <body>
          ${billContent.outerHTML}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className=" p-2 bg-white text-black font-mono text-[12px]">
      <div id="bill-to-print">
        <div className="text-center">
          <h2 className="font-bold text-lg">{team.name}</h2>
          <p>{team.address}</p>
          <p>Tel: {team.phone}</p>
          <div className="border-t border-dashed my-1"></div>
          <div className="flex justify-between">
            <span>Date: {formattedDate}</span>
            <span>{formattedTime}</span>
          </div>
          <div className="border-t border-dashed my-1"></div>
        </div>

        {/* Items */}
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className={`flex justify-between px-1 py-0.5 ${
              idx % 2 === 0 ? "bg-gray-100" : ""
            }`}
          >
            <span>{item.name}</span>
            <span>₹{item.total?.toFixed(2)}</span>
          </div>
        ))}

        <div className="border-t border-dashed my-1"></div>

        {/* Summary */}
        <div className="flex justify-between px-1 py-0.5">
          <span>Sub-total</span>
          <span>₹{(order.total - (order.tax || 0)).toFixed(2)}</span>
        </div>
        <div className="flex justify-between px-1 py-0.5">
          <span>Sales Tax</span>
          <span>₹{order.tax?.toFixed(2) || "0.00"}</span>
        </div>
        <div className="flex justify-between px-1 py-0.5 font-bold">
          <span>Total</span>
          <span>₹{order.total?.toFixed(2)}</span>
        </div>

        {/* QR Code */}
        <div className="text-center mt-2">
          <QRCode value={order._id} size={80} className="mx-auto" />
          <p className="text-[10px] mt-1">
            Scan to get a coupon for your next purchase!
          </p>
        </div>

        <div className="border-t border-dashed my-1"></div>
        <div className="text-center font-bold mt-1">THANK YOU</div>
      </div>

      <button
        onClick={printBill}
        className="w-full mt-2 py-1 bg-black text-white text-sm font-bold cursor-pointer"
      >
        Print Bill
      </button>
    </div>
  );
}
