"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatToINR } from "@/helper/transform";
import { useCart } from "@/store/hooks/useCart";

export const ProductCard = ({ product }) => {
  const { items, addItem, updateItemQuantity } = useCart();

  const cartItem = items.find((i) => i._id === product._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    if (quantity === 0) {
      addItem({ ...product, quantity: 1 });
    } else {
      updateItemQuantity({ _id: product._id, quantity: quantity + 1 });
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateItemQuantity({ _id: product._id, quantity: quantity - 1 });
    } else {
      updateItemQuantity({ _id: product._id, quantity: 0 });
    }
  };

  return (
    <Card className="w-full rounded-md m-0 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
      <CardContent className="flex flex-col">
        <div className="relative w-full min-h-24 md:h-48 flex items-center justify-center bg-gray-50 rounded-sm overflow-hidden group">
          <img
            src={
              product?.imageUrl ||
              "https://i.pinimg.com/1200x/d9/c3/c3/d9c3c3197bf7b789812f5eebd2069877.jpg"
            }
            alt={product?.title}
            className="w-full h-full object-cover max-h-24 md:max-h-48 transition-transform duration-300 group-hover:scale-105"
          />
          {/* {product?.discount && (
            <Badge className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-0.5 text-xs font-medium rounded">
              {product.discount}% OFF
            </Badge>
          )} */}

          <div className="flex absolute bottom-0 right-0 md:hidden items-center gap-2">
            {quantity === 0 ? (
              <Button onClick={handleAdd}>+ Add</Button>
            ) : (
              <div className="flex items-center gap-1">
                <Button onClick={handleDecrement} className="w-[15px]">
                  -
                </Button>
                <span>{quantity}</span>
                <Button onClick={handleAdd}>+</Button>
              </div>
            )}
          </div>
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

        <div className="md:flex mt-2 justify-between items-center">
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

          <div className="md:flex hidden items-center gap-2">
            {quantity === 0 ? (
              <Button onClick={handleAdd}>+ Add</Button>
            ) : (
              <div className="flex items-center gap-1">
                <Button onClick={handleDecrement}>-</Button>
                <span>{quantity}</span>
                <Button onClick={handleAdd}>+</Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
