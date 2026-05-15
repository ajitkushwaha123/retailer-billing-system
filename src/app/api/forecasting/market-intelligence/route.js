import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { getCrossShopDemand } from "@/lib/forecastUtils";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId") || "org_3A2LmFy3FhPPwapdkjv4tIMt1Hq";
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Global Trends
    const globalDemand = await getCrossShopDemand(orgId, 30);

    // 2. Competitor Leaderboard with robust image retrieval
    const competitorLeaderboard = await Order.aggregate([
      { $match: { orgId: { $ne: orgId }, createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: { orgId: "$orgId", productName: "$items.name" },
          totalSold: { $sum: "$items.quantity" },
          productId: { $first: "$items.productId" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      { $sort: { totalSold: -1 } },
      {
        $group: {
          _id: "$_id.orgId",
          topItems: { 
            $push: { 
              name: "$_id.productName", 
              sales: "$totalSold", 
              image: "$productInfo.imageUrl" 
            } 
          }
        }
      },
      { $project: { orgId: "$_id", topItems: { $slice: ["$topItems", 10] }, _id: 0 } },
      { $limit: 5 }
    ]);

    // Map city names from hardcoded list for better UI
    const competitorMap = {
      "org_comp_delhi_1": "Delhi",
      "org_comp_mumbai_1": "Mumbai",
      "org_comp_bangalore_1": "Bangalore",
      "org_comp_chennai_1": "Chennai",
      "org_comp_kolkata_1": "Kolkata"
    };

    const enrichedLeaderboard = competitorLeaderboard.map(comp => ({
      ...comp,
      city: competitorMap[comp.orgId] || "Neighbor"
    }));

    return NextResponse.json({
      trending_globally: globalDemand,
      competitor_leaderboard: enrichedLeaderboard
    });

  } catch (error) {
    console.error("Market Intelligence Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
