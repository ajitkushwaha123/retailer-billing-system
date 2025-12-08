import { NextResponse } from "next/server";
import Product from "@/models/Product";
import dbConnect from "@/lib/dbConnect";
import { auth } from "@clerk/nextjs/server";

export async function GET(req) {
  try {
    await dbConnect();
    const { orgId: organizationId } = await auth();

    if (!organizationId) {
      return NextResponse.json(
        { message: "organizationId is required" },
        { status: 400 }
      );
    }

    // Filter only by organization
    const filter = { organizationId };

    // 5 most selling products
    const topSold = await Product.find(filter)
      .sort({ totalSold: -1 })
      .limit(5)
      .select("title totalSold price sku imageUrl");

    // 5 lowest stock products
    const lowStock = await Product.find(filter)
      .sort({ stock: 1 }) // ascending order → lowest first
      .limit(5)
      .select("title stock price sku imageUrl");

    return NextResponse.json({
      data: {
        topSold,
        lowStock,
      },
      status: "success",
    });
  } catch (error) {
    console.log("Error: ", error);
    return NextResponse.json(
      { message: "Something went wrong", error: error.message },
      { status: 500 }
    );
  }
}
