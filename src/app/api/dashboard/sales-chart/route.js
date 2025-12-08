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
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: "startDate and endDate required" },
        { status: 400 }
      );
    }

    // Normalize dates
    let startDate = new Date(startDateParam);
    let endDate = new Date(endDateParam);
    endDate.setHours(23, 59, 59, 999);

    const sameDay = startDate.toDateString() === endDate.toDateString();

    const matchQuery = {
      orgId,
      createdAt: { $gte: startDate, $lte: endDate },
    };

    let pipeline = [];

    if (sameDay) {
      // ⭐ HOURLY AGGREGATION
      pipeline = [
        { $match: matchQuery },

        {
          $addFields: {
            hour: {
              $dateToString: {
                format: "%H",
                date: "$createdAt",
                timezone: "Asia/Kolkata",
              },
            },
          },
        },

        {
          $group: {
            _id: "$hour",
            totalSales: { $sum: "$total" },
            totalOrders: { $sum: 1 },
          },
        },

        { $sort: { _id: 1 } },
      ];
    } else {
      // ⭐ DAILY AGGREGATION
      pipeline = [
        { $match: matchQuery },

        {
          $addFields: {
            date: {
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
            _id: "$date",
            totalSales: { $sum: "$total" },
            totalOrders: { $sum: 1 },
          },
        },

        { $sort: { _id: 1 } },
      ];
    }

    let result = await Order.aggregate(pipeline);

    if (sameDay) {
      // Convert 24-hour format → 12-hour format
      result = result.map((r) => {
        const hour = parseInt(r._id);
        const period = hour >= 12 ? "PM" : "AM";
        const formattedHour = ((hour + 11) % 12) + 1; // convert

        return {
          hour: formattedHour + " " + period,
          totalSales: r.totalSales,
          totalOrders: r.totalOrders,
        };
      });
    } else {
      result = result.map((r) => ({
        date: r._id,
        totalSales: r.totalSales,
        totalOrders: r.totalOrders,
      }));
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Sales Chart Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales chart" },
      { status: 500 }
    );
  }
}
