"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { auth } from "@clerk/nextjs/server";
import Customer from "@/models/Customer";
import axios from "axios";

export async function POST(req) {
  try {
    await dbConnect();

    // Authenticate user
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate required fields
    const {
      storeName,
      customerName,
      customerPhone,
      paymentMethod,
      paymentStatus,
      items,
      subtotal,
      tax = 0,
      discount = 0,
      total,
    } = body;

    if (
      !customerName ||
      !customerPhone ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Missing required fields: customerName, customerPhone, or items",
        },
        { status: 400 }
      );
    }

    if (typeof total !== "number" || total <= 0) {
      return NextResponse.json(
        { message: "Invalid total amount" },
        { status: 400 }
      );
    }

    // Create or find customer
    let customer = await Customer.findOne({ phone: customerPhone, orgId });
    if (!customer) {
      customer = await Customer.create({
        name: customerName,
        phone: customerPhone,
        orgId,
        createdBy: userId,
      });
    }

    // Create order
    const newOrder = await Order.create({
      customerId: customer._id,
      items,
      subtotal,
      tax,
      discount,
      total,
      paymentStatus: paymentStatus || "pending",
      paymentMethod: paymentMethod || "cash",
      userId,
      orgId,
      status: "completed",
    });

    // Send WhatsApp notification (optional, wrapped in try/catch)
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/notification/send-template`,
        {
          phone: customerPhone,
          type: "order_details",
          data: {
            storeName: storeName || process.env.STORE_NAME || "Our Store",
            customerName,
            items: items
              .map((item) => `${item.name} (x${item.quantity})`)
              .join(", "),
            totalAmount: total.toFixed(2),
            paymentStatus: paymentStatus || "Pending",
          },
        }
      );
    } catch (waError) {
      console.warn("Failed to send WhatsApp notification:", waError?.message);
    }

    return NextResponse.json(
      {
        message: "Order created successfully",
        orderId: newOrder._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const query = orgId ? { orgId } : { userId };
    const orders = await Order.find(query)
      .populate("customerId", "name phone")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { message: "Orders fetched successfully", orders },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetching orders failed:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
