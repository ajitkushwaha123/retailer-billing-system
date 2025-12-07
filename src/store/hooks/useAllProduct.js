import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllProducts,
  resetProducts,
  addProductToOrg as addProductToOrgThunk,
} from "@/store/slices/allProductSlice";

export const useAllProducts = (page = 1, limit = 10) => {
  const dispatch = useDispatch();

  const { products, pagination, isLoading, error, addingProductIds } =
    useSelector((state) => state.allProducts);

  // Clear all products
  const clearProducts = () => {
    dispatch(resetProducts());
  };

  // Manual fetch (optional)
  const getAllProducts = () => {
    dispatch(fetchAllProducts({ page, limit }));
  };

  // Add product to organization
  const addProductToOrg = async (productId) => {
    try {
      const resultAction = await dispatch(addProductToOrgThunk(productId));
      if (addProductToOrgThunk.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        throw new Error(resultAction.payload || "Failed to add product to org");
      }
    } catch (err) {
      console.error("Failed to add product to org:", err);
      throw err;
    }
  };

  // Check if a product is being added
  const isAdding = (productId) => addingProductIds.includes(productId);

  return {
    products,
    pagination,
    isLoading,
    error,
    clearProducts,
    addProductToOrg,
    isAdding,
    getAllProducts,
  };
};
