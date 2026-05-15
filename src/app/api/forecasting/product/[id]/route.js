import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const orgId = "org_3A2LmFy3FhPPwapdkjv4tIMt1Hq";

    let product = await Product.findOne({ 
      $or: [
        { _id: id },
        { _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null }
      ].filter(q => q._id !== null)
    }).lean();

    // Fallback to allproducts collection directly if model fails
    if (!product) {
      product = await mongoose.connection.db.collection('allproducts').findOne({ 
        _id: mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id 
      });
    }

    if (!product) {
      // Diagnostic: Find one product for this org to prove we are connected and looking in the right place
      const sample = await Product.findOne({ organizationId: orgId }).lean();
      return NextResponse.json({ 
        error: "Product not found", 
        searched_id: id,
        org_id: orgId,
        db_state: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
        available_sample_in_org: sample ? { id: sample._id, title: sample.title } : "NONE"
      }, { status: 404 });
    }

    // 1. Fetch Historical Sales for this specific product
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const historicalSales = await Order.aggregate([
      { $match: { orgId, createdAt: { $gte: sixtyDaysAgo }, "items.productId": new mongoose.Types.ObjectId(id) } },
      { $unwind: "$items" },
      { $match: { "items.productId": new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          units: { $sum: "$items.quantity" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. Simple Prediction Logic for the Product
    const avgUnits = historicalSales.reduce((acc, curr) => acc + curr.units, 0) / (historicalSales.length || 1);
    
    // Day of Week Bias for this product
    const dowBias = {};
    for (let i = 0; i < 7; i++) {
      const days = historicalSales.filter(h => new Date(h._id).getDay() === i);
      dowBias[i] = days.length > 0 ? (days.reduce((a, c) => a + c.units, 0) / days.length) / (avgUnits || 1) : 1;
    }

    const chartData = [];
    
    // Past 15 days
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    for (let i = 15; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const actual = historicalSales.find(h => h._id === ds)?.units || 0;
      const predicted = Math.round(avgUnits * (dowBias[d.getDay()] || 1));
      
      chartData.push({ date: ds, actual, predicted, type: "historical" });
    }

    // Future 15 days
    for (let i = 1; i <= 15; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const ds = d.toISOString().split('T')[0];
      const predicted = Math.round(avgUnits * (dowBias[d.getDay()] || 1) * 1.1); // Add slight signal boost

      chartData.push({ date: ds, predicted, type: "forecast" });
    }

    return NextResponse.json({
      product: {
        title: product.title,
        stock: product.stock,
        totalSold: product.totalSold,
        price: product.price,
        category: product.category,
        image: product.imageUrl
      },
      chart_data: chartData,
      summary: {
        avg_daily_units: Math.round(avgUnits * 10) / 10,
        predicted_next_7_days: Math.round(avgUnits * 7 * 1.05),
        predicted_next_30_days: Math.round(avgUnits * 30 * 1.05)
      }
    });

  } catch (error) {
    console.error("Product Forecast Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
