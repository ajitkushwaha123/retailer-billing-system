"use client";

import React from "react";
import { ProductCard } from "../card";

export default function ProductGrid({ products = [], isSidebarOpen }) {
  return (
    <div
      className={`
        grid 
        grid-cols-2
        sm:grid-cols-2 
        md:grid-cols-2 
        lg:grid-cols-${isSidebarOpen ? "3" : "4"} 
        p-3 md:p-5 gap-4
      `}
    >
      {products.map((product, index) => (
        <ProductCard key={index} product={product} />
      ))}
    </div>
  );
}
