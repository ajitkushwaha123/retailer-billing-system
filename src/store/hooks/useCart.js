import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  addToCart,
} from "../slices/cartSlice";

export const useCart = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  const addItem = (item) => {
    dispatch(addToCart(item));
  };

  const removeItem = (id) => {
    dispatch(removeFromCart(id));
  };

  const updateItemQuantity = ({ _id, quantity }) => {
    dispatch(updateQuantity({ _id, quantity }));
  };

  const clearCartItems = () => {
    dispatch(clearCart());
  };

  return {
    items: cart.items,
    totalQuantity: cart.totalQuantity,
    totalAmount: cart.totalAmount,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCartItems,
  };
};
