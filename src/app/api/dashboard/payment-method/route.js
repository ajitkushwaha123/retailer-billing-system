import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    await dbConnect();

    const { userId, orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    // Aggregate orders by payment method
    const paymentMethods = await Order.aggregate([
      { $match: { orgId } },
      {
        $group: {
          _id: "$paymentMethod",
          totalOrders: { $sum: 1 },
          totalSales: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } }, // optional: sort by method name
    ]);

    // Map to a cleaner format
    const result = paymentMethods.map((pm) => ({
      paymentMethod: pm._id,
      totalOrders: pm.totalOrders,
      totalSales: pm.totalSales,
    }));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Payment Methods Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment method summary" },
      { status: 500 }
    );
  }
}
