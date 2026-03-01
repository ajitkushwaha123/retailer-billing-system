import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    await dbConnect();

    const { barcode } = await req.json();

    if (!barcode) {
      return NextResponse.json(
        { success: false, message: "Barcode is required" },
        { status: 400 },
      );
    }

    const product = await Product.findOne(
      { barcode },
      { __v: 0, createdAt: 0, updatedAt: 0, metadata: 0 },
    );

    if (!product) {
      await fetch("http://localhost:4000/emit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "product-not-found",
          payload: {
            barcode,
            message: "Product not found",
          },
        }),
      });

      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    await fetch("http://localhost:4000/emit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "product-found",
        payload: product,
      }),
    });

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error("Barcode scan error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
};
