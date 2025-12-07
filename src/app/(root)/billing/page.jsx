"use client";

import { CartStatusBar } from "@/components/global/billing/product/cart-status-bar";
import ProductGrid from "@/components/global/billing/product/product-grid";
import { useProduct } from "@/store/hooks/useProduct";
import { useOrganization } from "@clerk/nextjs";
import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import Loading from "@/components/loading";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const Page = () => {
  const { products, getProductByOrganization, isLoading } = useProduct();
  const { organization } = useOrganization();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const organizationId = organization?.id ?? null;

  useEffect(() => {
    if (organizationId) {
      getProductByOrganization(organizationId);
    }
  }, [organizationId]);

  const uniqueCategories = useMemo(() => {
    if (!products) return [];
    const categoriesSet = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(categoriesSet)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const getCategoryImage = (cat) => {
    if (!products || products.length === 0) return null;
    if (cat === "All") return products?.[0]?.imageUrl ?? null;

    const matchedProducts = products.filter((p) => p.category === cat);
    if (!matchedProducts.length) return null;

    return matchedProducts[0]?.imageUrl ?? null;
  };

  return (
    <div className="bg-white text-black h-screen flex overflow-hidden">
      {/* DESKTOP SIDE CATEGORY */}
      <div className="hidden md:flex flex-col w-64 border-r h-full bg-gray-50">
        <h2 className="font-semibold text-lg px-4 pt-4">Categories</h2>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-3 p-4">
            {uniqueCategories.map((cat) => {
              const catImg = getCategoryImage(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border text-left transition-All duration-200 cursor-pointer",
                    selectedCategory === cat
                      ? "bg-black text-white border-black shadow-lg scale-[1.02]"
                      : "bg-white text-black border-gray-300 hover:bg-gray-100"
                  )}
                >
                  {catImg ? (
                    <img
                      src={catImg}
                      alt={cat}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-lg">
                      📦
                    </div>
                  )}
                  <span className="text-sm font-medium">{cat}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* MAIN PANEL */}
      <div className="flex-1 overflow-y-hidden flex flex-col">
        {/* MOBILE CATEGORY SCROLLER */}
        <div className="block md:hidden px-3 pt-3">
          <ScrollArea className="whitespace-nowrap">
            <div className="flex gap-3 pb-2">
              {uniqueCategories.map((cat) => {
                const catImg = getCategoryImage(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "flex flex-col min-w-[90px] items-center p-2 rounded-lg border text-center transition-All duration-200 cursor-pointer shadow-sm",
                      selectedCategory === cat
                        ? "bg-black text-white border-black shadow-lg scale-[1.05]"
                        : "bg-white text-black border-gray-300 hover:bg-gray-200"
                    )}
                  >
                    {catImg ? (
                      <img
                        src={catImg}
                        alt={cat}
                        className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-lg">
                        📦
                      </div>
                    )}
                    <span className="text-xs mt-1 font-medium truncate max-w-[80px]">
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <CartStatusBar />

        <div className="flex-1 overflow-y-scroll">
          {isLoading ? (
            <Loading />
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
