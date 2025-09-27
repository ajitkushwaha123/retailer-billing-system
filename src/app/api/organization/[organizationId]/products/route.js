import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
  try {
    await dbConnect();
    const { organizationId } = await params;

    console.log("Organization ID from params:", organizationId);

    if (!organizationId) {
      return NextResponse.json(
        {
          message: "Organization ID is required",
          success: false,
        },
        {
          status: 400,
        }
      );
    }

    const products = await Product.find({
      organizationId,
    }).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        message: "Products fetched successfully",
        success: true,
        data: products,
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        message: err.message || "Internal Server Error",
        success: false,
      },
      {
        status: 500,
      }
    );
  }
};
