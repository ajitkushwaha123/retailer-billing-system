import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllProducts,
  searchProducts,
  resetProducts,
  addProductToOrg as addProductToOrgThunk,
} from "@/store/slices/allProductSlice";

export const useAllProducts = (page = 1, limit = 10) => {
  const dispatch = useDispatch();

  const { products, pagination, isLoading, error, addingProductIds } =
    useSelector((state) => state.allProducts);

  const clearProducts = () => {
    dispatch(resetProducts());
  };

  const getAllProducts = () => {
    dispatch(fetchAllProducts({ page, limit }));
  };

  const searchAllProducts = (searchValue) => {
    dispatch(searchProducts({ search: searchValue, page, limit }));
  };

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
    searchAllProducts,
  };
};
