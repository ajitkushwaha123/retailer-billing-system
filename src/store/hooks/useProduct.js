import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../slices/productSlice";

export const useProduct = () => {
  const dispatch = useDispatch();

  const { products, isLoading, error } = useSelector((state) => state.products);

  const getProductByOrganization = async (organizationId) => {
    console.log("Fetching products for organization ID:", organizationId);
    try {
      await dispatch(fetchProducts(organizationId)).unwrap();
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  return { products, isLoading, error, getProductByOrganization };
};
