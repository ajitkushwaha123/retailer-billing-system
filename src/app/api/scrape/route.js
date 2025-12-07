import { NextResponse } from "next/server";
import axios from "axios";
import AllProduct from "@/models/AllProduct"; 
import dbConnect from "@/lib/dbConnect";

export const GET = async (req) => {
  try {
    await dbConnect();
    console.log("DB Connected");

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || "19";
    const pageNo = searchParams.get("pageNo") || "1";

    const API_URL = `https://api.hyperpure.com/consumer/v2/search?categoryIds=${categoryId}&outletId=1460978&pageNo=${pageNo}&sourcePage=CATEGORY_PAGE&entity_id=3&entity_type=category_grid&external_campaign_id=&external_campaign_type=&parent_reference_id=e1f1846d-d0a5-418a-bd15-c814d46d771d-1764672916725689574&parent_reference_type=e1f1846d-d0a5-418a-bd15-c814d46d771d-1764672916725689574&search_source=&source_page=&sub_reference_id=&sub_reference_type=&fetchThroughV2=false&searchDebugFlag=false&onlyInStock=false&getGlobalCatalog=false`;

    const HEADERS = {
      Cookie:
        "_ga=GA1.1.618256562.1764011972; _ga_8HE6Y2HT51=GS2.1.s1764617218$o1$g0$t1764617218$j60$l0$h0; _ga_FJQ5LTF1T0=GS2.1.s1764672374$o3$g1$t1764673547$j60$l0$h0; _gid=GA1.2.218404478.1764617219",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDb250ZXh0IjpudWxsLCJJZGVudGl0eSI6eyJjbGllbnQiOiJjb25zdW1lciIsImlkIjoyMDA4OTQ2LCJ1c2VyYXV0aGlkIjoxMzQ4MTE0fSwiZXhwIjoxNzY5ODU2NDA2LCJqdGkiOiI2MGU0NTdhZi0yYTkyLTRmZjEtYTU3ZS01MmE2MDQ4YmQyOGIiLCJpYXQiOjE3NjQ2NzI0MDZ9.kbXf8ZvrIVfiyy5t8d0_IU-XboE7ikl2LRVQs2lzkIg",
      "sec-ch-ua-platform": '"Windows"',
      "sec-ch-ua":
        '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
      HeaderRoute: "v2",
      "sec-ch-ua-mobile": "?0",
      DeviceId: "28317f26-76ab-4322-9786-428cf7e1a68c_uuid",
      AppType: "mweb",
      "x-appmode": "STANDARD",
      Accept: "application/json, text/plain, */*",
      "X-Client": "consumer",
      DeviceName: "Windows_Chrome",
      "X-TrackingId": "46c4847b-ca76-467d-8587-677ca2b9e248",
      APIVersion: "12.1",
      "X-Clientplatform": "mweb",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      Request_Url:
        "https://www.hyperpure.com/in/milk-milk-powder?&type=CATALOG",
      "X-OutletId": "1460978",
    };

    const apiResponse = await axios.get(API_URL, { headers: HEADERS });

    const rawProducts = apiResponse.data.response?.Products || [];

    if (!rawProducts.length) {
      return NextResponse.json(
        { message: "No products found." },
        { status: 200 }
      );
    }

    const productsToInsert = rawProducts.map((product) => {
      const quantityData = product.Quantity || {};
      const priceData = product.UnitPriceV2 || {};

      const priceString = priceData.Price
        ? priceData.Price.replace(/[^\d.]/g, "")
        : null;

      const priceVal = priceString
        ? parseFloat(priceString)
        : product.Price?.PriceVal || 0;

      const sellingPrice = product.SmallestBulkPrice
        ? parseFloat(product.SmallestBulkPrice.replace(/[^\d.]/g, ""))
        : priceVal;

      const uniqueId = `HP-${product.Id}`;

      return {
        title: product.Name || uniqueId,
        description: product.Description
          ? product.Description.replace(/<\/?[^>]+(>|$)/g, "")
          : `Product ID: ${product.Id}`,

        price: sellingPrice,
        mrp: priceVal,
        discount: 0,

        stock: product.AvailableInventory || 0,
        unit: quantityData.Unit || "pcs",
        weight: parseFloat(quantityData.DisplayValue) || null,

        category: product.ParentCategoryName || product.CategoryName,
        brand: product.Brand,

        sku: uniqueId,
        barcode: product.ProductNumber || null,
        imageUrl: product.ImagePath,
        gallery: [],

        tags: product.Scoring?.Keywords || [product.CategoryName],
        isActive: product.IsInStock,

        metadata: product,
      };
    });

    const results = await Promise.all(
      productsToInsert.map((product) =>
        AllProduct.findOneAndUpdate(
          { sku: product.sku }, 
          product,
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          }
        )
      )
    );

    const insertedCount = results.filter(
      (doc) => doc.createdAt.getTime() === doc.updatedAt.getTime()
    ).length;

    return NextResponse.json(
      {
        message: "Sync completed",
        total_synced: results.length,
        inserted_new: insertedCount,
        updated_existing: results.length - insertedCount,
        categoryId,
        pageNo,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Sync failed:", err);
    return NextResponse.json(
      {
        error: "Failed to sync product data",
        details: err.message,
      },
      { status: 500 }
    );
  }
};
