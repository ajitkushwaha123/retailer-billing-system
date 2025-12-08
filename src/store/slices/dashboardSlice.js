import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🌀 Thunk for fetching dashboard stats
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchDashboardStats",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/dashboard/total-revenue", {
        params: { startDate, endDate },
      });
      return res.data; // { range: { start, end }, summary: { ... , growth: {...} } }
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
      growth: {
        totalSales: 0,
        totalOrders: 0,
        newCustomers: 0,
      },
    },
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
      state.loading = false;
      state.error = null;
    },
    setDateRange: (state, action) => {
      state.range.start = action.payload.start;
      state.range.end = action.payload.end;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.range.start = action.payload.range.start;
        state.range.end = action.payload.range.end;
        state.summary = action.payload.summary;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load dashboard stats";
      });
  },
});

export const { resetDashboardState, setDateRange } = dashboardSlice.actions;
export default dashboardSlice.reducer;
