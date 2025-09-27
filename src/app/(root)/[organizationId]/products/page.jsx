"use client";
import { DataTable } from "@/components/data-table";
import { useProduct } from "@/store/hooks/useProduct";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

const page = () => {
  const columnConfig = [
    { key: "title", label: "Title", type: "text", editable: false },
    { key: "description", label: "Description", type: "text", editable: true },
    { key: "price", label: "Price", type: "badge" },
    { key: "mrp", label: "MRP", type: "badge" },
    { key: "discount", label: "Discount (%)", type: "input" },
    { key: "stock", label: "Stock", type: "input" },
    {
      key: "unit",
      label: "Unit",
      type: "select",
      options: ["kg", "g", "L", "ml", "pcs"],
    },
    { key: "weight", label: "Weight", type: "input" },
    { key: "category", label: "Category", type: "text" },
    { key: "brand", label: "Brand", type: "text" },
    { key: "sku", label: "SKU", type: "text", editable: false },
    { key: "barcode", label: "Barcode", type: "text" },
    { key: "imageUrl", label: "Image", type: "image" },
    { key: "tags", label: "Tags", type: "tags" },
    { key: "isActive", label: "Active", type: "status" },
    { key: "expiryDate", label: "Expiry Date", type: "date" },
    { key: "manufactureDate", label: "MFG Date", type: "date" },
    { key: "shelfLife", label: "Shelf Life", type: "text" },
  ];

  const { products, getProductByOrganization } = useProduct();

  const { organizationId } = useParams();

  console.log("Organization ID from params:", organizationId);

  useEffect(() => {
    if (organizationId) {
      getProductByOrganization(organizationId);
    }
  }, [organizationId]);
  console.log("Products:", products);

  return (
    <div className="flex flex-1 flex-col py-5">
      <DataTable data={products || []} columnConfig={columnConfig} />
    </div>
  );
};

export default page;
