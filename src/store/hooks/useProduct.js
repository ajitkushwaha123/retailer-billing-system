import { useSelector, dispatch } from "react-redux";
import { fetchProducts } from "../slices/productSlice";

export const useProduct = () => {
  const { products, isLoading, error } = useSelector((state) => state.products);

  const getProductByOrganization = async (organizationId) => {
    console.log("Fetching products for organization ID:", organizationId);
    await dispatch(fetchProducts(organizationId)).unwrap();
  };

  return { products, isLoading, error, getProductByOrganization };
};
