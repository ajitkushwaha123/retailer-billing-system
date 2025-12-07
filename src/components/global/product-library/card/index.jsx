"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatToINR } from "@/helper/transform";
import { useAllProducts } from "@/store/hooks/useAllProduct";

export const ProductLibraryCard = ({ product }) => {
  const { addProductToOrg } = useAllProducts();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToOrg = async () => {
    try {
      setLoading(true);
      await addProductToOrg(product._id);
      setAdded(true);
    } catch (err) {
      console.error("Failed to add product:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full rounded-md shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
      <CardContent className="flex flex-col">
        <div className="relative w-full min-h-24 flex items-center justify-center bg-gray-50 rounded-sm overflow-hidden group">
          <img
            src={
              product?.imageUrl ||
              "https://i.pinimg.com/1200x/d9/c3/c3/d9c3c3197bf7b789812f5eebd2069877.jpg"
            }
            alt={product?.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="flex pt-3 flex-col gap-1">
          <p className="text-xs text-gray-500 truncate">{product?.category}</p>
          <h3 className="text-sm font-semibold line-clamp-1">
            {product?.title}
          </h3>
          <p className="text-xs hidden md:block text-gray-600 mt-1">
            By {product?.brand}
          </p>
        </div>

        <div className="flex mt-2 justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 text-sm">
              {formatToINR(product?.price)}
            </span>
            {product?.mrp && (
              <span className="text-xs text-gray-400 line-through">
                {formatToINR(product.mrp)}
              </span>
            )}
          </div>

          <div>
            <Button
              onClick={handleAddToOrg}
              disabled={loading || added}
              className={`px-4 py-1 rounded-md text-sm ${
                added
                  ? "bg-green-500 hover:bg-green-500 cursor-default"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? "Adding..." : added ? "Added" : "+ Add to Org"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
