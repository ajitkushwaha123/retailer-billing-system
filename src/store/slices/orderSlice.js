import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get("/api/orders");

      return data.orders;
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to fetch";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (payload, thunkAPI) => {
    try {
      const { data } = await axios.post("/api/orders", payload);

      return data;
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to create";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    loading: false,
    error: null,
    createSuccess: false,
  },

  reducers: {
    resetOrderState: (state) => {
      state.error = null;
      state.createSuccess = false;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.orders = action.payload || [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.createSuccess = true;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.createSuccess = false;
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
