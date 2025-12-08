import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardStats,
  resetDashboardState,
} from "@/store/slices/dashboardSlice";

export const useDashboard = ({ startDate, endDate } = {}) => {
  const dispatch = useDispatch();

  const { range, summary, loading, error } = useSelector(
    (state) => state.dashboard
  );

  // Fetch dashboard stats on mount or when dates change
  useEffect(() => {
    if (startDate && endDate) {
      dispatch(fetchDashboardStats({ startDate, endDate }));
    }

    // Optional cleanup: reset dashboard state on unmount
    return () => dispatch(resetDashboardState());
  }, [dispatch, startDate, endDate]);

  // Refetch function
  const refetch = () => {
    if (startDate && endDate) {
      dispatch(fetchDashboardStats({ startDate, endDate }));
    }
  };

  return {
    range, // { start, end }
    summary, // { totalSales, totalOrders, newCustomers, recurringCustomers, growth }
    growth: summary?.growth || {
      totalSales: 0,
      totalOrders: 0,
      newCustomers: 0,
    },
    loading,
    error,
    refetch,
  };
};
