import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import allProductReducer from "./slices/allProductSlice";
import ordersReducer from "./slices/orderSlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    allProducts: allProductReducer,
    orders: ordersReducer,
  },
});
