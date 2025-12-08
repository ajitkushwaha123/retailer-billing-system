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

    // Read Query Params
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Convert properly to dates
    let startDate = startDateParam
      ? new Date(`${startDateParam}T00:00:00.000Z`)
      : null;

    let endDate = endDateParam
      ? new Date(`${endDateParam}T23:59:59.999Z`)
      : null;

    const matchQuery = { orgId };

    if (startDate && endDate) {
      matchQuery.createdAt = { $gte: startDate, $lte: endDate };
    }

    const result = await Order.aggregate([
      { $match: matchQuery },

      // Convert date to local YYYY-MM-DD string
      {
        $addFields: {
          dateString: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "Asia/Kolkata",
            },
          },
        },
      },

      {
        $group: {
          _id: "$dateString",
          totalSales: { $sum: "$total" },
          totalOrders: { $sum: 1 },
        },
      },

      {
        $sort: { _id: 1 },
      },

      {
        $project: {
          date: "$_id",
          totalSales: 1,
          totalOrders: 1,
          _id: 0,
        },
      },
    ]);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Daily Sales Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily sales summary" },
      { status: 500 }
    );
  }
}
