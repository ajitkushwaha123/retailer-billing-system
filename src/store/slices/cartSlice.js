import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], 
  totalQuantity: 0,
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existingItem = state.items.find((i) => i._id === item._id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }

      state.totalQuantity += 1;
      state.totalAmount += item.price;
    },

    removeFromCart: (state, action) => {
      const _id = action.payload;
      const existingItem = state.items.find((i) => i._id === _id);

      if (existingItem) {
        state.totalQuantity -= existingItem.quantity;
        state.totalAmount -= existingItem.price * existingItem.quantity;
        state.items = state.items.filter((i) => i._id !== _id);
      }
    },

    updateQuantity: (state, action) => {
      const { _id, quantity } = action.payload;
      const item = state.items.find((i) => i._id === _id);

      if (item) {
        const diff = quantity - item.quantity;
        item.quantity = quantity;

        state.totalQuantity += diff;
        state.totalAmount += diff * item.price;

        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i._id !== _id);
        }
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
