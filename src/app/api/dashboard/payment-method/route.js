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

    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let dateFilter = {};

    // Apply date filter only if both are valid
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(`${endDate}T23:59:59.999Z`),
      };
    }

    // Aggregate orders by payment method
    const paymentMethods = await Order.aggregate([
      {
        $match: {
          orgId,
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          totalOrders: { $sum: 1 },
          totalSales: { $sum: "$total" },
        },
      },
      { $sort: { totalSales: -1 } }, // Sort descending by total sales
      { $limit: 5 }, // Return only top 5
    ]);

    // Map to cleaner format
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
