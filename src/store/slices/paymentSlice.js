import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API call to create QR & Razorpay customer
export const createPaymentQR = createAsyncThunk(
  "payment/createPaymentQR",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/payment/qr/create", payload);

      // Backend returns this format:
      // {
      //   success: true,
      //   customer: {...},
      //   qr: {...}
      // }

      return {
        customer: res.data.customer,
        qr: res.data.qr,
      };
    } catch (err) {
      if (err.response) {
        return rejectWithValue(err.response.data);
      }
      return rejectWithValue({ message: err.message || "Network error" });
    }
  }
);

const initialState = {
  qr: null,
  customer: null,
  status: "idle", // idle | loading | success | failed
  error: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPayment: (state) => {
      state.qr = null;
      state.customer = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentQR.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createPaymentQR.fulfilled, (state, action) => {
        state.status = "success";
        state.qr = action.payload.qr;
        state.customer = action.payload.customer;
      })
      .addCase(createPaymentQR.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.qr = null;
        state.customer = null;
      });
  },
});

export const { clearPayment } = paymentSlice.actions;

export default paymentSlice.reducer;
