import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server"; // CLERK IMPORT
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product"; // Ensure this path points to your schema file

const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Helpers ---

const getMimeType = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  const types = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
  };
  return types[ext] || "image/jpeg";
};

const cleanAndParseJSON = (text) => {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error:", text);
    return [];
  }
};

async function callGemini(base64Data, mimeType) {
  const model = geminiAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Analyze this inventory image. Extract product names and their visible stock counts.
  Return strictly a JSON array: [{"name": "Exact Product Name", "stock": 10}].
  Be precise with the names. Do not include markdown.`;

  const imagePart = {
    inlineData: { data: base64Data, mimeType: mimeType },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  return cleanAndParseJSON(response.text());
}

// --- Main Handler ---

export async function POST(req) {
  try {
    // 1. Auth Check
    const { orgId, userId } = await auth();

    // If you strictly require an Organization (B2B SaaS), use check below:
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID missing. Please create an org." },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const { fileBase64, fileName } = body;

    if (!fileBase64 || !fileName) {
      return NextResponse.json({ error: "Missing file data" }, { status: 400 });
    }

    // 2. Get Data from Gemini
    const mimeType = getMimeType(fileName);
    const scannedItems = await callGemini(fileBase64, mimeType);

    if (!scannedItems || scannedItems.length === 0) {
      return NextResponse.json({
        message: "No products detected in image",
        data: [],
      });
    }

    // 3. Update Database (Stock += Received)
    const updateResults = {
      success: [],
      failed: [],
    };

    for (const item of scannedItems) {
      // Find and update in one go using findOneAndUpdate with $inc
      const updatedProduct = await Product.findOneAndUpdate(
        {
          organizationId: orgId, // Ensure we only touch this Org's data
          title: { $regex: new RegExp(`^${item.name}$`, "i") }, // Case-insensitive exact match
        },
        {
          $inc: { stock: item.stock }, // Increment stock
        },
        { new: true } // Return the updated document
      );

      if (updatedProduct) {
        updateResults.success.push({
          name: updatedProduct.title,
          added: item.stock,
          newTotal: updatedProduct.stock,
        });
      } else {
        updateResults.failed.push({
          name: item.name,
          reason: "Product not found in database",
        });
      }
    }

    return NextResponse.json({
      message: "Inventory processing complete",
      summary: {
        totalScanned: scannedItems.length,
        updated: updateResults.success.length,
        notFound: updateResults.failed.length,
      },
      details: updateResults,
    });
  } catch (error) {
    console.error("Inventory Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
