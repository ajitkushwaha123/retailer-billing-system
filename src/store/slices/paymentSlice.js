import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// CREATE PAYMENT QR
export const createPaymentQR = createAsyncThunk(
  "payment/createPaymentQR",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/payment/qr/create", payload);

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

// CREATE PAYMENT LINK (NEW)
export const createPaymentLink = createAsyncThunk(
  "payment/createPaymentLink",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/payment/links/create", payload);

      return {
        payment_link: res.data.payment_link,
        raw: res.data.raw,
      };
    } catch (err) {
      if (err.response) {
        return rejectWithValue(err.response.data);
      }
      return rejectWithValue({ message: err.message || "Network error" });
    }
  }
);

// SEND PAYMENT REMINDER NOTIFICATION
export const sendPaymentReminder = createAsyncThunk(
  "payment/sendPaymentReminder",
  async (
    { phone, customerName, amount, dueDate, storeName, paymentLink },
    { rejectWithValue }
  ) => {
    try {
      const payload = {
        phone,
        type: "payment_reminder_with_payment_links_new",
        data: {
          customerName,
          amount,
          dueDate,
          storeName,
          paymentLink,
        },
      };

      const res = await axios.post("/api/notification/send-template", payload);

      return res.data;
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
  payment_link: null,
  raw_link_data: null,

  status: "idle", // QR
  linkStatus: "idle", // payment link
  reminderStatus: "idle",

  error: null,
  linkError: null,
  reminderError: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPayment: (state) => {
      state.qr = null;
      state.customer = null;
      state.payment_link = null;
      state.raw_link_data = null;

      state.status = "idle";
      state.linkStatus = "idle";
      state.error = null;
      state.linkError = null;
    },
    clearReminder: (state) => {
      state.reminderStatus = "idle";
      state.reminderError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /** QR CREATION FLOW */
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
      })

      /** PAYMENT LINK CREATION FLOW */
      .addCase(createPaymentLink.pending, (state) => {
        state.linkStatus = "loading";
        state.linkError = null;
      })
      .addCase(createPaymentLink.fulfilled, (state, action) => {
        state.linkStatus = "success";
        state.payment_link = action.payload.payment_link;
        state.raw_link_data = action.payload.raw;
      })
      .addCase(createPaymentLink.rejected, (state, action) => {
        state.linkStatus = "failed";
        state.linkError = action.payload;
        state.payment_link = null;
        state.raw_link_data = null;
      })

      /** PAYMENT REMINDER FLOW */
      .addCase(sendPaymentReminder.pending, (state) => {
        state.reminderStatus = "loading";
        state.reminderError = null;
      })
      .addCase(sendPaymentReminder.fulfilled, (state) => {
        state.reminderStatus = "success";
      })
      .addCase(sendPaymentReminder.rejected, (state, action) => {
        state.reminderStatus = "failed";
        state.reminderError = action.payload;
      });
  },
});

export const { clearPayment, clearReminder } = paymentSlice.actions;

export default paymentSlice.reducer;
