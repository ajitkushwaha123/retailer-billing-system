import AllProduct from "@/models/AllProduct";
import Product from "@/models/Product";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const POST = async (req, { params }) => {
  try {
    const { productId } = await params;
    const { userId, orgId } = await auth();

    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID not found" },
        { status: 400 }
      );
    }

    const masterProduct = await AllProduct.findById(productId);
    if (!masterProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existingProduct = await Product.findOne({
      organizationId: orgId,
      sku: masterProduct.sku,
    });

    const productData = {
      userId,
      organizationId: orgId,
      title: masterProduct.title,
      description: masterProduct.description,
      price: masterProduct.price,
      mrp: masterProduct.mrp || masterProduct.price,
      discount: masterProduct.discount || 0,
      stock: masterProduct.stock || 0,
      unit: masterProduct.unit || "pcs",
      weight: masterProduct.weight || null,
      category: masterProduct.category || "",
      brand: masterProduct.brand || "",
      sku: masterProduct.sku || "",
      barcode: masterProduct.barcode || "",
      imageUrl: masterProduct.imageUrl || "",
      gallery: masterProduct.gallery || [],
      tags: masterProduct.tags || [],
      isActive:
        masterProduct.isActive !== undefined ? masterProduct.isActive : true,
      expiryDate: masterProduct.expiryDate || null,
      manufactureDate: masterProduct.manufactureDate || null,
      shelfLife: masterProduct.shelfLife || "",
      metadata: masterProduct.metadata || {},
    };

    if (existingProduct) {
      await Product.updateOne({ _id: existingProduct._id }, productData);

      return NextResponse.json({
        message: "Product updated successfully",
        type: "updated",
      });
    }

    const newProduct = new Product(productData);
    await newProduct.save();

    return NextResponse.json({
      message: "Product added successfully",
      type: "created",
    });
  } catch (err) {
    console.error("PRODUCT_ADD_ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
