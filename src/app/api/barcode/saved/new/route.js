import dbConnect from "@/lib/dbConnect";
import BarcodeReader from "@/models/BarcodeReader";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    await dbConnect();

    const body = await req.json();

    const { items } = body;

    /*
      Expected Payload:

      {
        "items": [
          {
            "barcode": "123456",
            "timestamp": "2026-05-12T10:00:00Z"
          },
          {
            "barcode": "789456",
            "timestamp": "2026-05-12T10:01:00Z"
          }
        ]
      }
    */

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Items are required",
        },
        { status: 400 },
      );
    }

    const formattedItems = items.map((item) => ({
      barcode: item.barcode,
      createdAt: item.timestamp || new Date(),
    }));

    const savedBarcodes = await BarcodeReader.insertMany(formattedItems);

    return NextResponse.json({
      success: true,
      message: "Barcodes saved successfully",
      count: savedBarcodes.length,
      data: savedBarcodes,
    });
  } catch (error) {
    console.error("Barcode save error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
};
