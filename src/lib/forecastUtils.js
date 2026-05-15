import Order from "@/models/Order";
import Product from "@/models/Product";

/**
 * Aggregates sales volume across all organizations to find network-wide demand.
 * Returns an array of { productName, totalQuantity }
 */
export async function getCrossShopDemand(excludeOrgId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const matchStage = {
    createdAt: { $gte: startDate }
  };

  if (excludeOrgId) {
    matchStage.orgId = { $ne: excludeOrgId };
  }

  const pipeline = [
    { $match: matchStage },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        totalQuantity: { $sum: "$items.quantity" },
        avgPrice: { $avg: "$items.sellingPrice" },
        productId: { $first: "$items.productId" }
      },
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
    { $sort: { totalQuantity: -1 } },
    { $limit: 20 },
    {
      $project: {
        productName: "$_id",
        totalQuantity: 1,
        avgPrice: 1,
        imageUrl: { $ifNull: ["$productInfo.imageUrl", ""] },
        _id: 0,
      },
    },
  ];

  return await Order.aggregate(pipeline);
}

/**
 * Predicts future sales for a specific shop based on historical trends.
 * Returns projections for tomorrow, 7d, 15d, and 30d.
 */
export async function calculateSalesForecast(orgId, activeSignals) {
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  // 1. Get daily sales for the last 60 days
  const history = await Order.aggregate([
    { $match: { orgId, createdAt: { $gte: sixtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        dailyRevenue: { $sum: "$total" },
        dayOfWeek: { $first: { $dayOfWeek: "$createdAt" } } // 1 (Sun) to 7 (Sat)
      }
    },
    { $sort: { _id: 1 } }
  ]);

  if (history.length === 0) return null;

  // 2. Calculate average daily revenue (Weighting last 7 days more)
  const last7Days = history.slice(-7);
  const avgOverall = history.reduce((acc, curr) => acc + curr.dailyRevenue, 0) / history.length;
  const avgRecent = last7Days.reduce((acc, curr) => acc + curr.dailyRevenue, 0) / (last7Days.length || 1);
  
  const baseVelocity = (avgOverall * 0.4) + (avgRecent * 0.6);

  // 3. Detect Day-of-Week Bias
  const dowBias = {};
  for (let i = 1; i <= 7; i++) {
    const days = history.filter(h => h.dayOfWeek === i);
    if (days.length > 0) {
      const avgForDay = days.reduce((acc, curr) => acc + curr.dailyRevenue, 0) / days.length;
      dowBias[i] = avgForDay / (avgOverall || 1);
    } else {
      dowBias[i] = 1;
    }
  }

  // 4. Calculate Historical Totals for Growth Comparison
  const getHistoricalTotal = (days) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return history
      .filter(h => new Date(h._id) >= cutoff)
      .reduce((acc, curr) => acc + curr.dailyRevenue, 0);
  };

  const prev7Total = getHistoricalTotal(7);
  const prev15Total = getHistoricalTotal(15);
  const prev30Total = getHistoricalTotal(30);
  const todayTotal = history.length > 0 ? history[history.length - 1].dailyRevenue : avgOverall;

  // 5. Project Forward
  const project = (days) => {
    let total = 0;
    const start = new Date();
    for (let i = 1; i <= days; i++) {
      const futureDate = new Date(start);
      futureDate.setDate(start.getDate() + i);
      const dow = futureDate.getDay() + 1; 
      
      let multiplier = dowBias[dow] || 1;
      
      if (activeSignals.includes("WEEKEND") && (dow === 1 || dow === 7)) multiplier *= 1.15;
      if (activeSignals.includes("HOT_WEATHER")) multiplier *= 1.1;

      total += baseVelocity * multiplier;
    }
    return Math.round(total);
  };

  const next1 = project(1);
  const next7 = project(7);
  const next15 = project(15);
  const next30 = project(30);

  const calcGrowth = (next, prev) => {
    if (!prev) return 0;
    return Math.round(((next - prev) / prev) * 100);
  };

  return {
    tomorrow: { val: next1, growth: calcGrowth(next1, todayTotal) },
    next_7_days: { val: next7, growth: calcGrowth(next7, prev7Total) },
    next_15_days: { val: next15, growth: calcGrowth(next15, prev15Total) },
    next_30_days: { val: next30, growth: calcGrowth(next30, prev30Total) },
    historical_avg: Math.round(avgOverall)
  };
}

export function calculateComprehensiveScore(product, activeSignals, globalDemand) {
  let score = 0;

  // 1. Environmental Fit (Base Score from Signals)
  const productTags = product.tags || [];
  const demandCategory = product.demand_category || []; // Fallback if exists
  
  const allSignals = [...productTags, ...demandCategory];
  
  for (const signal of activeSignals) {
    if (allSignals.includes(signal)) {
      score += 20; // Signal match bonus
    }
  }

  // 2. Global Popularity Bonus
  const globalMatch = globalDemand.find(d => d.productName === product.title);
  if (globalMatch) {
    score += Math.min(globalMatch.totalQuantity * 2, 50); // Up to 50 points for global volume
  }

  // 3. Local Sales Performance
  const localSales = product.totalSold || 0;
  score += Math.min(localSales * 1.5, 30); // Up to 30 points for local popularity

  // Normalize level
  let level = "LOW";
  if (score >= 80) level = "HIGH";
  else if (score >= 40) level = "MEDIUM";

  return { score, level };
}
