"use server";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { auth } from "@clerk/nextjs/server";
import Customer from "@/models/Customer";
import axios from "axios";
import Product from "@/models/Product";

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

    // Find or create customer
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

    // 🟡 UPDATE STOCK & SOLD COUNT
    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        organizationId: orgId,
      });

      console.log("Updating product stock for:", item.productId);
      if (!product) continue;

      const updatedStock = product.stock - item.quantity;

      await Product.updateOne(
        { _id: item.productId, organizationId: orgId },
        {
          $set: {
            stock: updatedStock < 0 ? 0 : updatedStock,
          },
          $inc: {
            totalSold: item.quantity,
          },
        }
      );
    }

    // Send WhatsApp message (non-blocking)
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
      console.warn("WhatsApp sending failed:", waError?.message);
    }

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: newOrder,
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
      .sort({ createdAt: -1 })
      .limit(100);

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
