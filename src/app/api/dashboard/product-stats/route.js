import { NextResponse } from "next/server";
import Product from "@/models/Product";
import dbConnect from "@/lib/dbConnect";
import { auth } from "@clerk/nextjs/server";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const { orgId: organizationId } = await auth();

    if (!organizationId) {
      return NextResponse.json(
        { message: "organizationId is required" },
        { status: 400 }
      );
    }

    const filter = { organizationId };

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const topSold = await Product.find(filter)
      .sort({ totalSold: -1 })
      .limit(5)
      .select("title totalSold price sku imageUrl");

    const topStock = await Product.find(filter)
      .sort({ stock: -1 })
      .limit(5)
      .select("title stock price sku imageUrl");

    const topPrice = await Product.find(filter)
      .sort({ price: -1 })
      .limit(5)
      .select("title price sku imageUrl stock");

    return NextResponse.json({
      data: {
        topSold,
        topStock,
        topPrice,
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
