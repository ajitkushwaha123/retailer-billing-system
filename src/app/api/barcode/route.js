import dbConnect from "@/lib/dbConnect";
import BarcodeReader from "@/models/BarcodeReader";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    await dbConnect();

    const body = await req.json();
    const { barcode } = body || {};

    if (!barcode) {
      return NextResponse.json(
        { success: false, message: "Barcode is required" },
        { status: 400 }
      );
    }

    const barcodeDoc = await BarcodeReader.create({ barcode });

    return NextResponse.json(
      {
        success: true,
        message: "Barcode saved successfully",
        data: barcodeDoc,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Barcode save error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
};
