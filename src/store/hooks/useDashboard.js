import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardStats,
  fetchPaymentMethods,
  fetchProductStats,
  resetDashboardState,
} from "@/store/slices/dashboardSlice";

export const useDashboard = () => {
  const dispatch = useDispatch();
  const {
    range,
    summary,
    paymentMethods,
    topSellingProducts,
    lowStockProducts,
    loading,
    error,
  } = useSelector((state) => state.dashboard);

  const refetch = () => {
    dispatch(fetchDashboardStats());
    dispatch(fetchPaymentMethods());
    dispatch(fetchProductStats());
  };

  return {
    range,
    summary,
    paymentMethods,
    topSellingProducts,
    lowStockProducts,
    loading,
    error,
    refetch,
  };
};
