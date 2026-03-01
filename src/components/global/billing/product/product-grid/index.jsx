"use client";

import React, { useEffect } from "react";
import { ProductCard } from "../card";
import { useCart } from "@/store/hooks/useCart";
import { socket } from "@/lib/socket";

export default function ProductGrid({ products = [], isSidebarOpen }) {
  const { items, addItem, updateItemQuantity } = useCart();

  useEffect(() => {
    const handleProductFound = (scannedProduct) => {
      const existing = items.find((i) => i._id === scannedProduct._id);

      if (existing) {
        updateItemQuantity({
          _id: scannedProduct._id,
          quantity: existing.quantity + 1,
        });
      } else {
        addItem({ ...scannedProduct, quantity: 1 });
      }
    };

    socket.on("product-found", handleProductFound);

    socket.on("product-not-found", (data) => {
      alert("Product not found!");
    });

    return () => {
      socket.off("product-found", handleProductFound);
      socket.off("product-not-found");
    };
  }, [items, addItem, updateItemQuantity]);

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
