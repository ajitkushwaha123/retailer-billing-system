import BardcodeReader from "@/models/BardcodeReader";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const { barcode } = await req.json();
    if (!barcode) {
      return NextResponse.json(
        { error: "Barcode is required" },
        { status: 400 }
      );
    }

    const newBarcode = new BardcodeReader({ barcode });
    await newBarcode.save();

    return NextResponse.json(
      { message: "Barcode saved successfully", data: newBarcode },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
