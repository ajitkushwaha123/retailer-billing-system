import Order from "@/models/Order";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    const { userId, orgId } = await auth();

    if (!orgId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 86400000);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Calculate previous period for growth comparison
    const diffMs = end - start;
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - diffMs);
    prevStart.setHours(0, 0, 0, 0);
    prevEnd.setHours(23, 59, 59, 999);

    // Function to aggregate stats for a given period
    const aggregateStats = async (periodStart, periodEnd) => {
      const agg = await Order.aggregate([
        {
          $match: {
            orgId,
            createdAt: { $gte: periodStart, $lte: periodEnd },
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" },
            totalOrders: { $sum: 1 },
            customers: { $addToSet: "$customerId" },
          },
        },
      ]);

      const stats = agg[0] || { totalSales: 0, totalOrders: 0, customers: [] };
      return stats;
    };

    const currentStats = await aggregateStats(start, end);
    const prevStats = await aggregateStats(prevStart, prevEnd);

    // New vs Recurring customers for current period
    const allTimeCustomerOrders = await Order.aggregate([
      {
        $match: { orgId, paymentStatus: "paid" },
      },
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

    // Growth calculation helper
    const calcGrowth = (current, previous) => {
      if (previous === 0) return current === 0 ? 0 : 100;
      return ((current - previous) / previous) * 100;
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
        newCustomers: calcGrowth(newCustomers, prevStats.customers.length),
      },
    };

    return NextResponse.json({
      range: { start, end },
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
