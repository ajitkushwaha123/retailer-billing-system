import { NextResponse } from "next/server";
import DynamicEnvironmentMetadata from "@/models/demand-forcasting/DynamicEnvironmentMetadata";
import dbConnect from "@/lib/dbConnect";

export async function GET(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: "start_date and end_date are required" },
        { status: 400 }
      );
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    const data = await DynamicEnvironmentMetadata.find({
      date: {
        $gte: start,
        $lte: end,
      },
    }).sort({ date: 1 });

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Error fetching weather data:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}