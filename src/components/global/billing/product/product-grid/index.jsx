"use client";

import React from "react";
import { ProductCard } from "../card";

export default function ProductGrid({ products = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 p-3 md:p-5 gap-4 lg:grid-cols-3">
      {products.map((product, index) => (
        <ProductCard key={index} product={product} />
      ))}
    </div>
  );
}
