import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  products: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  isLoading: false,
  error: null,
  addingProductIds: [], // track products being added to org
};

// Thunk to fetch all products with pagination
export const fetchAllProducts = createAsyncThunk(
  "products/fetchAllProducts",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/product-library?page=${page}&limit=${limit}`
      );
      return response.data; // { products, pagination }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const addProductToOrg = createAsyncThunk(
  "products/addProductToOrg",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/product-library/${productId}/add`
      );
      return { productId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add product to organization"
      );
    }
  }
);

const allProductSlice = createSlice({
  name: "allProducts",
  initialState,
  reducers: {
    resetProducts: (state) => {
      state.products = [];
      state.pagination = initialState.pagination;
      state.error = null;
      state.isLoading = false;
      state.addingProductIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Add product to organization
      .addCase(addProductToOrg.pending, (state, action) => {
        state.addingProductIds.push(action.meta.arg); // mark as adding
      })
      .addCase(addProductToOrg.fulfilled, (state, action) => {
        const index = state.addingProductIds.indexOf(action.payload.productId);
        if (index > -1) state.addingProductIds.splice(index, 1); // remove from adding
        // Mark product as added to org in state
        const product = state.products.find(
          (p) => p._id === action.payload.productId
        );
        if (product) product.addedToOrg = true;
      })
      .addCase(addProductToOrg.rejected, (state, action) => {
        const index = state.addingProductIds.indexOf(action.meta.arg);
        if (index > -1) state.addingProductIds.splice(index, 1); // remove from adding
        state.error = action.payload;
      });
  },
});

export const { resetProducts } = allProductSlice.actions;
export default allProductSlice.reducer;
