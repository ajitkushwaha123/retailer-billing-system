import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { extractDemandSignals } from "@/lib/extractDemandSignal";
import { 
  getCrossShopDemand, 
  calculateComprehensiveScore 
} from "@/lib/forecastUtils";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { forecast_features, orgId } = body;
    const currentOrgId = orgId || "org_3A2LmFy3FhPPwapdkjv4tIMt1Hq";

    const activeSignals = extractDemandSignals(forecast_features);
    const globalDemand = await getCrossShopDemand(currentOrgId, 30); 

    const localProducts = await Product.find({ organizationId: currentOrgId, isActive: true }).lean();
    
    const categoryStats = {};
    const inventoryHealth = [];

    const scoredProducts = localProducts.map((product) => {
      const result = calculateComprehensiveScore(product, activeSignals, globalDemand);
      const cat = product.category || "Uncategorized";
      
      if (!categoryStats[cat]) categoryStats[cat] = { count: 0, totalScore: 0 };
      categoryStats[cat].count++;
      categoryStats[cat].totalScore += result.score;

      inventoryHealth.push({
        id: product._id.toString(),
        name: product.title,
        image: product.imageUrl,
        stock: product.stock,
        demand: result.score,
        status: (result.score > 70 && product.stock < 10) ? "CRITICAL" : (result.score > 50 && product.stock < 20) ? "WARNING" : "HEALTHY"
      });

      return { ...product, demand_score: result.score, demand_level: result.level };
    });

    return NextResponse.json({
      inventory_health: inventoryHealth.sort((a, b) => b.demand - a.demand),
      category_analysis: Object.entries(categoryStats).map(([name, stats]) => ({
        name,
        avg_demand: Math.round(stats.totalScore / stats.count)
      })),
      signals: activeSignals
    });

  } catch (error) {
    console.error("Inventory Health Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
