"use client";

import EmptyState from "@/components/empty-state";
import { ProductLibraryCard } from "@/components/global/product-library/card";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { useAllProducts } from "@/store/hooks/useAllProduct";
import { Search } from "lucide-react";
import React, { useState, useEffect } from "react";

const ProductLibrary = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 100;

  const {
    products,
    pagination,
    isLoading,
    error,
    getAllProducts,
    searchAllProducts,
  } = useAllProducts(page, limit);

  const handlePrev = () => {
    if (pagination.hasPrevPage) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (pagination.hasNextPage) setPage((prev) => prev + 1);
  };

  // Load & search based on page
  useEffect(() => {
    if (search.trim().length < 2) {
      getAllProducts();
    } else {
      searchAllProducts(search);
    }
  }, [page]);

  // Debounced search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      if (search.trim().length < 2) {
        getAllProducts();
      } else {
        searchAllProducts(search);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="p-6 w-full space-y-6">
      <div className="w-full">
        <div className="flex items-center w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-4 py-3 shadow-sm focus-within:ring-2 ring-[#0025cc] transition-all">
          <Search className="text-gray-400 mr-3" size={20} />
          <input
            type="text"
            placeholder="Search products by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-base focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />

          <Button
            type="submit"
            className="ml-2 bg-[#0025cc] hover:bg-[#1c3eff] text-white px-4 py-1.5 text-sm rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </Button>
        </div>
      </div>

      {error && (
        <div className="py-16">
          <p className="text-red-500 text-center text-lg">{error}</p>
        </div>
      )}

      {!isLoading && !error && products.length === 0 && (
        <div className="py-20">
          <EmptyState
            title={
              search.length > 1
                ? "No Matching Products Found"
                : "No Products Added Yet"
            }
            actionLabel="Add New Product"
            onAction={() => console.log("Redirect to add product")}
          />
        </div>
      )}

      {isLoading ? (
        <Loading />
      ) : (
        <>
          {products.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductLibraryCard key={product._id} product={product} />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-4 border-t pt-6">
                <button
                  onClick={handlePrev}
                  disabled={!pagination.hasPrevPage}
                  className={`px-5 py-2 rounded-md font-medium min-w-[120px] transition ${
                    pagination.hasPrevPage
                      ? "bg-gray-900 text-white hover:bg-black"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  ← Previous
                </button>

                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Page {pagination.page} of {pagination.totalPages} • Total{" "}
                  {pagination.total}
                </span>

                <button
                  onClick={handleNext}
                  disabled={!pagination.hasNextPage}
                  className={`px-5 py-2 rounded-md font-medium min-w-[120px] transition ${
                    pagination.hasNextPage
                      ? "bg-gray-900 text-white hover:bg-black"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ProductLibrary;
