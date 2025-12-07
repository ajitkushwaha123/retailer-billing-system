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

    const product = await AllProduct.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const newProduct = new Product({
      userId,
      organizationId: orgId,
      title: product.title,
      description: product.description,
      price: product.price,
      mrp: product.mrp || product.price,
      discount: product.discount || 0,
      stock: product.stock || 0,
      unit: product.unit || "pcs",
      weight: product.weight || null,
      category: product.category || "",
      brand: product.brand || "",
      sku: product.sku || "",
      barcode: product.barcode || "",
      imageUrl: product.imageUrl || "",
      gallery: product.gallery || [],
      tags: product.tags || [],
      isActive: product.isActive !== undefined ? product.isActive : true,
      expiryDate: product.expiryDate || null,
      manufactureDate: product.manufactureDate || null,
      shelfLife: product.shelfLife || "",
      metadata: product.metadata || {},
    });

    await newProduct.save();

    return NextResponse.json({ message: "Product added successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
