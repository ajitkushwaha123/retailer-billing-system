import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Bill from "@/models/Bill";
import { auth } from "@clerk/nextjs/server";
import { Customer } from "@/models/Customer";

function generateBillNumber() {
  const prefix = "KRV";
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${year}-${random}`;
}

export async function POST(req) {
  try {
    await dbConnect();

    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized user" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      customerName,
      customerPhone,
      paymentMethod,
      paymentStatus,
      items,
      subtotal,
      tax,
      discount,
      total,
    } = body;

    if (!customerPhone || !customerName || !items || items.length === 0) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    let customer = await Customer.findOne({ phone: customerPhone, orgId });

    if (!customer) {
      customer = await Customer.create({
        name: customerName,
        phone: customerPhone,
        orgId,
        createdBy: userId,
      });
    }

    const newOrder = await Order.create({
      customerId: customer._id,
      items,
      subtotal,
      tax,
      discount,
      total,
      paymentStatus,
      paymentMethod,
      userId,
      orgId,
      status: "pending",
    });

    const billNumber = generateBillNumber();

    const bill = await Bill.create({
      billNumber,
      orderId: newOrder._id,
      customerName,
      customerPhone,
      items,
      subtotal,
      tax,
      discount,
      total,
      userId,
      orgId,
    });

    return NextResponse.json(
      {
        message: "Order & Bill created successfully",
        orderId: newOrder._id,
        billId: bill.billNumber,
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

export async function GET() {
  try {
    await dbConnect();

    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const query = orgId ? { orgId } : { userId };

    const orders = await Order.find(query)
      .populate("customerId")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        message: "Orders fetched",
        orders,
      },
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
