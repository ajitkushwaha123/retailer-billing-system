"use client";
import { CartStatusBar } from "@/components/global/billing/product/cart-status-bar";
import ProductGrid from "@/components/global/billing/product/product-grid";
import { useProduct } from "@/store/hooks/useProduct";
import { useOrganization } from "@clerk/nextjs";
import React, { useEffect } from "react";

const page = () => {
  const { products, isLoading, error, getProductByOrganization } = useProduct();
  const { organization } = useOrganization();

  const organizationId = organization?.id ?? null;

  useEffect(() => {
    if (organizationId) {
      getProductByOrganization(organizationId);
    }
  }, [organizationId]);

  return (
    <div>
      <CartStatusBar />
      <ProductGrid products={products} />
    </div>
  );
};

export default page;
