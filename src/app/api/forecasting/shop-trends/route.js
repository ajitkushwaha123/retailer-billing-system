import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { extractDemandSignals } from "@/lib/extractDemandSignal";
import axios from "axios";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { forecast_features, orgId } = body;
    const currentOrgId = orgId || "org_3A2LmFy3FhPPwapdkjv4tIMt1Hq";

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Fetch Historical Sales
    const historicalSales = await Order.aggregate([
      { $match: { orgId: currentOrgId, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { ds: "$_id", y: "$total", _id: 0 } }
    ]);

    // 2. Fetch External Forecast for the points
    let externalPoints = [];
    try {
      const forecastResponse = await axios.post("http://localhost:8000/api/forecast", {
        data: historicalSales,
        days: 15
      });
      if (forecastResponse.data.success) {
        externalPoints = forecastResponse.data.forecast;
      }
    } catch (err) {
      console.warn("External Forecast failed for shop-trends:", err.message);
    }

    // 3. Generate Chart Data
    const chartData = [];
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    const localSignals = extractDemandSignals(forecast_features);
    const avgHist = historicalSales.reduce((acc, curr) => acc + curr.y, 0) / (historicalSales.length || 1);

    historicalSales.forEach(h => {
      const date = new Date(h.ds);
      if (date >= fifteenDaysAgo) {
        const dow = date.getDay() + 1;
        const dayMatch = localSignals.includes("WEEKEND") && (dow === 1 || dow === 7);
        const predicted = Math.round(avgHist * (dayMatch ? 1.2 : 0.95)); 

        chartData.push({
          date: h.ds,
          actual: h.y,
          predicted: predicted,
          type: "historical"
        });
      }
    });

    externalPoints.forEach(p => {
      chartData.push({
        date: p.date,
        predicted: Math.max(0, Math.round(p.predicted_sales)),
        type: "forecast"
      });
    });

    return NextResponse.json({ chart_data: chartData });

  } catch (error) {
    console.error("Shop Trends Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
