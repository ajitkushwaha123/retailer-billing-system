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

    // 1. Fetch Historical Sales for External API
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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

    // 2. Call External Forecasting API
    let externalProjections = null;
    try {
      const forecastResponse = await axios.post("http://localhost:8000/api/forecast", {
        data: historicalSales,
        days: 30
      });
      
      if (forecastResponse.data.success) {
        const ext = forecastResponse.data;
        const avgHist = historicalSales.reduce((acc, curr) => acc + curr.y, 0) / (historicalSales.length || 1);
        
        externalProjections = {
          tomorrow: { 
            val: Math.max(0, Math.round(ext.tomorrow_prediction.predicted_sales)), 
            growth: Math.round(((ext.tomorrow_prediction.predicted_sales - avgHist) / (avgHist || 1)) * 100)
          },
          next_7_days: { 
            val: Math.max(0, Math.round(ext.next_7_days_total)), 
            growth: Math.round(((ext.next_7_days_total - (avgHist * 7)) / (avgHist * 7 || 1)) * 100)
          },
          next_30_days: { 
            val: Math.max(0, Math.round(ext.next_30_days_total)), 
            growth: Math.round(((ext.next_30_days_total - (avgHist * 30)) / (avgHist * 30 || 1)) * 100)
          }
        };
      }
    } catch (apiError) {
      console.warn("External Forecasting API failed:", apiError.message);
    }

    const activeSignals = extractDemandSignals(forecast_features);

    return NextResponse.json({
      summary: { active_signals: activeSignals },
      projections: externalProjections
    });

  } catch (error) {
    console.error("Forecasting Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
