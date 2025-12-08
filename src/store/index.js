import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import allProductReducer from "./slices/allProductSlice";
import ordersReducer from "./slices/orderSlice";
import paymentReducer from "./slices/paymentSlice";
import dashboardReducer from "./slices/dashboardSlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    allProducts: allProductReducer,
    orders: ordersReducer,
    payment: paymentReducer,
    dashboard: dashboardReducer,
  },
});
