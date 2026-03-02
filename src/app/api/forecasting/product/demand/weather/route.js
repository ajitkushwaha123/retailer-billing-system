import { NextResponse } from "next/server";
import Product from "@/models/Product";
import dbConnect from "@/lib/dbConnect";
import { extractDemandSignals } from "@/lib/extractDemandSignal";
import { calculateDemand } from "@/lib/calculatedDemand";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const { forecast_features } = body;

    if (!forecast_features) {
      return NextResponse.json(
        { error: "forecast_features is required" },
        { status: 400 }
      );
    }

    const activeSignals = extractDemandSignals(forecast_features);

    const products = await Product.find({
      isActive: true,
      demand_category: { $in: activeSignals }
    }).lean();

    const scoredProducts = products.map((product) => {
      const demand = calculateDemand(
        product.base_demand_score,
        product.demand_category,
        activeSignals
      );

      return {
        ...product,
        demand_score: demand.score,
        demand_level: demand.level
      };
    });

    const response = {
      weather_signals: activeSignals,
      high_demand: scoredProducts.filter(p => p.demand_level === "HIGH"),
      medium_demand: scoredProducts.filter(p => p.demand_level === "MEDIUM"),
      low_demand: scoredProducts.filter(p => p.demand_level === "LOW")
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error("Demand API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}