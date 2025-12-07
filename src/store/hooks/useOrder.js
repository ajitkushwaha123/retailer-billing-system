import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  fetchOrders,
  createOrder,
  resetOrderState,
} from "../slices/orderSlice";

export const useOrders = () => {
  const dispatch = useDispatch();

  const { orders, loading, error, createSuccess } = useSelector(
    (state) => state.orders
  );

  /**
   * Fetch orders
   */
  const loadOrders = useCallback(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  /**
   * Create an order
   */
  const addOrder = useCallback(
    async (payload) => {
      const result = await dispatch(createOrder(payload)).unwrap();

      // You can check success from result if needed
      if (createOrder.fulfilled.match(result)) {
        // auto refresh orders on success (optional)
        dispatch(fetchOrders());
      }

      return result;
    },
    [dispatch]
  );

  /**
   * Reset status flags
   */
  const resetState = useCallback(() => {
    dispatch(resetOrderState());
  }, [dispatch]);

  return {
    orders,
    loading,
    error,
    createSuccess,

    /** actions */
    addOrder,
    loadOrders,
    resetState,
  };
};
