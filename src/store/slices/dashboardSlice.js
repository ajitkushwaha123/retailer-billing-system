import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchDashboardStats",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { start, end } = getState().dashboard.range;

      const res = await axios.get("/api/dashboard/total-revenue", {
        params: { startDate: start, endDate: end },
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  }
);

export const fetchProductStats = createAsyncThunk(
  "dashboard/fetchProductStats",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { start, end } = getState().dashboard.range;

      const res = await axios.get("/api/dashboard/product-stats", {
        params: { startDate: start, endDate: end },
      });

      return {
        topSelling: res.data.data?.topSold || [],
        lowStock: res.data.data?.lowStock || [],
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  }
);

export const fetchPaymentMethods = createAsyncThunk(
  "dashboard/fetchPaymentMethods",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { start, end } = getState().dashboard.range;

      const res = await axios.get("/api/dashboard/payment-method", {
        params: { startDate: start, endDate: end },
      });
      return res.data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  }
);

// ⭐ NEW — Fetch sales chart stats
export const fetchSalesChart = createAsyncThunk(
  "dashboard/fetchSalesChart",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { start, end } = getState().dashboard.range;

      const res = await axios.get("/api/dashboard/sales-chart", {
        params: { startDate: start, endDate: end },
      });

      return res.data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    range: { start: null, end: null },
    summary: {
      totalSales: 0,
      totalOrders: 0,
      newCustomers: 0,
      recurringCustomers: 0,
      growth: { totalSales: 0, totalOrders: 0, newCustomers: 0 },
    },
    paymentMethods: [],
    topSellingProducts: [],
    lowStockProducts: [],
    salesChartData: [], // ⭐ Add this
    loading: false,
    error: null,
  },

  reducers: {
    resetDashboardState: (state) => {
      state.range = { start: null, end: null };
      state.summary = {
        totalSales: 0,
        totalOrders: 0,
        newCustomers: 0,
        recurringCustomers: 0,
        growth: { totalSales: 0, totalOrders: 0, newCustomers: 0 },
      };
      state.paymentMethods = [];
      state.topSellingProducts = [];
      state.lowStockProducts = [];
      state.salesChartData = [];
      state.loading = false;
      state.error = null;
    },

    setDateRange: (state, action) => {
      state.range.start = action.payload.start || null;
      state.range.end = action.payload.end || null;
      state.topSellingProducts = [];
      state.lowStockProducts = [];
      state.salesChartData = [];
    },
  },

  extraReducers: (builder) => {
    // TOTAL REVENUE
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // PAYMENT METHODS
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // PRODUCT STATS
    builder
      .addCase(fetchProductStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductStats.fulfilled, (state, action) => {
        state.loading = false;
        state.topSellingProducts = action.payload.topSelling || [];
        state.lowStockProducts = action.payload.lowStock || [];
      })
      .addCase(fetchProductStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ⭐ SALES CHART
    builder
      .addCase(fetchSalesChart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSalesChart.fulfilled, (state, action) => {
        state.loading = false;
        state.salesChartData = action.payload;
      })
      .addCase(fetchSalesChart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetDashboardState, setDateRange } = dashboardSlice.actions;
export default dashboardSlice.reducer;
