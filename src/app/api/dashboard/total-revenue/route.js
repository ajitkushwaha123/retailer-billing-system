import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    let startDate = searchParams.get("startDate");
    let endDate = searchParams.get("endDate");

    const { orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();

    // Normalize start & end dates
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Previous range calculations
    const diffMs = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - diffMs);

    prevStart.setHours(0, 0, 0, 0);
    prevEnd.setHours(23, 59, 59, 999);

    // Aggregation helper
    const aggregateStats = async (periodStart, periodEnd) => {
      const agg = await Order.aggregate([
        {
          $match: {
            orgId,
            createdAt: { $gte: periodStart, $lte: periodEnd }, // ⬅ NO paymentStatus filter now
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" }, // includes all orders
            totalOrders: { $sum: 1 },
            customers: { $addToSet: "$customerId" },
          },
        },
      ]);

      return agg[0] || { totalSales: 0, totalOrders: 0, customers: [] };
    };

    const currentStats = await aggregateStats(start, end);
    const prevStats = await aggregateStats(prevStart, prevEnd);

    // Customer first order date (all-time)
    const allTimeCustomerOrders = await Order.aggregate([
      { $match: { orgId } }, // ⬅ now NO paid filtering
      {
        $group: {
          _id: "$customerId",
          firstOrder: { $min: "$createdAt" },
        },
      },
    ]);

    const newCustomers = allTimeCustomerOrders.filter(
      (c) => c.firstOrder >= start && c.firstOrder <= end
    ).length;

    const recurringCustomers = currentStats.customers.length - newCustomers;

    const calcGrowth = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    const summary = {
      totalSales: currentStats.totalSales,
      totalOrders: currentStats.totalOrders,
      newCustomers,
      recurringCustomers,
      growth: {
        totalSales: calcGrowth(currentStats.totalSales, prevStats.totalSales),
        totalOrders: calcGrowth(
          currentStats.totalOrders,
          prevStats.totalOrders
        ),
        newCustomers: calcGrowth(
          newCustomers,
          prevStats.customers?.length || 0
        ),
      },
    };

    return NextResponse.json({
      range: {
        start,
        end,
        prevStart,
        prevEnd,
      },
      summary,
    });
  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
