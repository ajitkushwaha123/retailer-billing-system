"use client";

import { DataTable } from "@/components/data-table";
import { useProduct } from "@/store/hooks/useProduct";
import { useOrganization } from "@clerk/nextjs";
import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";

const Page = () => {
  const columnConfig = [
    { key: "imageUrl", label: "Image", type: "image" },
    { key: "title", label: "Title", type: "text", editable: false },
    // { key: "description", label: "Description", type: "text", editable: true },
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
    { key: "tags", label: "Tags", type: "tags" },
    { key: "isActive", label: "Active", type: "status" },
    { key: "expiryDate", label: "Expiry Date", type: "date" },
    { key: "manufactureDate", label: "MFG Date", type: "date" },
    { key: "shelfLife", label: "Shelf Life", type: "text" },
  ];

  const { products, isLoading, error, getProductByOrganization } = useProduct();
  const { organization } = useOrganization();

  const organizationId = organization?.id ?? null;

  useEffect(() => {
    if (organizationId) {
      getProductByOrganization(organizationId);
    }
  }, [organizationId]);

  return (
    <div className="flex flex-1 min-h-screen w-full flex-col py-5">
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-red-500 font-medium">
            Failed to load products: {error}
          </p>
        </div>
      )}

      {!isLoading && !error && products.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">No products available.</p>
        </div>
      )}

      {!isLoading && !error && products.length > 0 && (
        <div className="w-full max-w-full overflow-x-auto">
          <DataTable
            className="min-w-max"
            data={products}
            columnConfig={columnConfig}
          />
        </div>
      )}
    </div>
  );
};

export default Page;
