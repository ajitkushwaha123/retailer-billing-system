"use client";

import React from "react";
import { useCart } from "@/store/hooks/useCart";
import { Button } from "@/components/ui/button";
import { formatToINR } from "@/helper/transform";
import { Minus, Plus, Trash } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CustomerDialog } from "../dialog/customer-dialog";

export const CartStatusBar = () => {
  const {
    items,
    addItem,
    totalQuantity,
    totalAmount,
    removeItem,
    updateItemQuantity,
  } = useCart();

  if (!items || items.length === 0) return null;

  return (
    <div className="sticky top-0 left-0 right-0 z-50 bg-white shadow-md border-t border-gray-200 px-4 py-3 flex items-center justify-between">
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="flex -space-x-2">
              {items.slice(0, 2).map((item) => (
                <img
                  key={item?._id}
                  src={
                    item?.imageUrl ||
                    "https://via.placeholder.com/40x40.png?text=Item"
                  }
                  alt={item?.name}
                  className="w-8 h-8 rounded-full border border-white object-cover"
                />
              ))}
              {items.length > 2 && (
                <span className="w-8 h-8 rounded-full bg-gray-200 text-xs flex items-center justify-center">
                  +{items.length - 2}
                </span>
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium">{totalQuantity} items</p>
              <p className="text-xs text-gray-500">
                {formatToINR(totalAmount)}
              </p>
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-4">
          <h3 className="font-semibold mb-2">Cart Summary</h3>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={
                      item.imageUrl ||
                      "https://via.placeholder.com/40x40.png?text=Item"
                    }
                    alt={item.name}
                    className="w-10 h-10 rounded-md object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatToINR(item.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6"
                    onClick={() =>
                      updateItemQuantity({
                        _id: item._id,
                        quantity: Math.max(item.quantity - 1, 0),
                      })
                    }
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-medium">{item.quantity}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6"
                    onClick={() =>
                      updateItemQuantity({
                        _id: item._id,
                        quantity: item.quantity + 1,
                      })
                    }
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-red-500"
                    onClick={() => removeItem(item._id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            <p className="text-sm font-medium">
              Total: {formatToINR(totalAmount)}
            </p>
            {/* <Button className="bg-green-500 hover:bg-green-600 text-white">
              Checkout
            </Button> */}
            <CustomerDialog />
          </div>
        </PopoverContent>
      </Popover>
      
      {/* <Button
        className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg"
        onClick={() => console.log("Proceed to checkout")}
      >
        Checkout
      </Button> */}

      <CustomerDialog />
    </div>
  );
};
