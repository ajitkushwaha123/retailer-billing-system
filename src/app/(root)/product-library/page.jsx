"use client";

import { ProductLibraryCard } from "@/components/global/product-library/card";
import { useAllProducts } from "@/store/hooks/useAllProduct";
import React, { useState, useEffect } from "react";

const ProductLibrary = () => {
  const [page, setPage] = useState(1);
  const limit = 100;

  const {
    products,
    pagination,
    isLoading,
    error,
    clearProducts,
    getAllProducts,
  } = useAllProducts(page, limit);

  const handlePrev = () => {
    if (pagination.hasPrevPage) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (pagination.hasNextPage) setPage((prev) => prev + 1);
  };

  useEffect(() => {
    getAllProducts();
  }, [page]);
  return (
    <div className="p-6 w-full">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800">
        Product Library
      </h1>

      {isLoading && (
        <p className="text-gray-500 text-center py-10 animate-pulse">
          Loading products...
        </p>
      )}

      {error && <p className="text-red-500 text-center py-10">{error}</p>}

      {!isLoading && products.length === 0 && (
        <p className="text-gray-500 text-center py-10">No products found.</p>
      )}

      {!isLoading && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductLibraryCard key={product._id} product={product} />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-3">
            <button
              onClick={handlePrev}
              disabled={!pagination.hasPrevPage}
              className={`px-5 py-2 rounded-lg font-medium transition ${
                pagination.hasPrevPage
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              &larr; Previous
            </button>

            <span className="text-gray-700 font-medium">
              Page {pagination.page} of {pagination.totalPages} | Total:{" "}
              {pagination.total} Products
            </span>

            <button
              onClick={handleNext}
              disabled={!pagination.hasNextPage}
              className={`px-5 py-2 rounded-lg font-medium transition ${
                pagination.hasNextPage
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next &rarr;
            </button>
          </div>
        </>
      )}

      <div className="mt-6 flex justify-center">
        <button
          onClick={clearProducts}
          className="px-6 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition"
        >
          Reset Products
        </button>
      </div>
    </div>
  );
};

export default ProductLibrary;
