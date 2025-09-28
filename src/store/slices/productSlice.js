import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  products: [],
  isLoading: false,
  error: null,
};

// Thunk to fetch products by organizationId
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (organizationId, { rejectWithValue }) => {
    try {
      console.log("Fetching products for organization ID:", organizationId);

      const response = await axios.get(
        `/api/organization/${organizationId}/products`
      );

      console.log("Fetched products:", response.data);
      return response.data.data; 
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    resetProducts: (state) => {
      state.products = [];
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetProducts } = productSlice.actions;
export default productSlice.reducer;
