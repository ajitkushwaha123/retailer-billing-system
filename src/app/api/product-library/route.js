import dbConnect from "@/lib/dbConnect";
import AllProduct from "@/models/AllProduct";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const products = await AllProduct.find();
    const slicedProducts = products.slice(skip, skip + limit);

    const total = products.length;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        products: slicedProducts,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        message: "Products fetched successfully (sliced)",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch product library" },
      { status: 500 }
    );
  }
};
