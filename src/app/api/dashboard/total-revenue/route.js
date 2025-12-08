import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");
    const orgId = searchParams.get("orgId"); // Multi-tenant filtering

    if (!orgId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    // If no start/end passed → last 30 days
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();

    // Ensure end covers entire day (till 11:59 PM)
    end.setHours(23, 59, 59, 999);

    const sales = await Order.aggregate([
      {
        $match: {
          orgId,
          createdAt: { $gte: start, $lte: end },
          paymentStatus: "paid", // only completed sales count
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          totalTax: { $sum: "$tax" },
          totalDiscount: { $sum: "$discount" },
          totalSubtotal: { $sum: "$subtotal" },
        },
      },
    ]);

    const dailyBreakdown = await Order.aggregate([
      {
        $match: {
          orgId,
          createdAt: { $gte: start, $lte: end },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          total: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const result = sales[0] || {
      totalSales: 0,
      totalOrders: 0,
      totalTax: 0,
      totalDiscount: 0,
      totalSubtotal: 0,
    };

    return NextResponse.json({
      range: { start, end },
      summary: result,
      dailyStats: dailyBreakdown,
    });
  } catch (error) {
    console.log("Sales Fetch Error", error);
    return NextResponse.json(
      { error: "Failed to fetch sales stats" },
      { status: 500 }
    );
  }
}
