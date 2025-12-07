import { useDispatch, useSelector } from "react-redux";
import { createPaymentQR, clearPayment } from "@/store/slices/paymentSlice";

export function usePayment() {
  const dispatch = useDispatch();

  const { qr, status, error } = useSelector((state) => state.payment);

  const generatePayment = (payload) => {
    dispatch(createPaymentQR(payload));
  };

  const resetPayment = () => {
    dispatch(clearPayment());
  };

  return {
    qr,
    status,
    error,
    generatePayment,
    resetPayment,
  };
}
