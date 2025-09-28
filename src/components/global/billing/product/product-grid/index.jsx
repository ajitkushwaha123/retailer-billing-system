"use client";

import React from "react";
import { ProductCard } from "../card";

export default function ProductGrid({ products = [] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 p-3 md:p-5 gap-4 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={index} product={product} />
      ))}
    </div>
  );
}
