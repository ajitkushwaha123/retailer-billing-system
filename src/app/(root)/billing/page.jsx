"use client";

import { CartStatusBar } from "@/components/global/billing/product/cart-status-bar";
import ProductGrid from "@/components/global/billing/product/product-grid";
import { useProduct } from "@/store/hooks/useProduct";
import { useOrganization } from "@clerk/nextjs";
import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import Loading from "@/components/loading";

const Page = () => {
  const { products, getProductByOrganization, isLoading } = useProduct();
  const { organization } = useOrganization();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const organizationId = organization?.id ?? null;

  useEffect(() => {
    if (organizationId) {
      getProductByOrganization(organizationId);
    }
  }, [organizationId]);

  const uniqueCategories = useMemo(() => {
    if (!products) return [];
    const categoriesSet = new Set(products.map((p) => p.category));
    return ["all", ...Array.from(categoriesSet)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const getCategoryImage = (cat) => {
    if (!products || products.length === 0) return null;
    if (cat === "all") return products?.[0]?.image ?? null;
    const matchedProducts = products.filter((p) => p.category === cat);
    if (!matchedProducts.length) return null;
    return matchedProducts[0]?.image ?? null;
  };

  return (
    <div className="bg-white text-black h-screen flex gap-6 overflow-hidden">
      {/* Category Column */}
      <div className="flex flex-col w-64 border-r h-full">
        <h2 className="font-semibold text-lg px-4 pt-4">Categories</h2>

        <div className="flex flex-col gap-2 overflow-y-scroll p-4 pb-20">
          {uniqueCategories.map((cat) => {
            const catImg = getCategoryImage(cat);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left",
                  selectedCategory === cat
                    ? "bg-black text-white border-black shadow-md"
                    : "bg-white text-black border-gray-300 hover:bg-gray-100"
                )}
              >
                {catImg ? (
                  <img
                    src={catImg}
                    alt={cat}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                    📦
                  </div>
                )}
                <span className="text-sm font-medium truncate">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-scroll h-full">
        <CartStatusBar />
        {isLoading ? <Loading /> : <ProductGrid products={filteredProducts} />}
      </div>
    </div>
  );
};

export default Page;
