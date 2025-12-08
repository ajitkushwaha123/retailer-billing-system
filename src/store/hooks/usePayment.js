import { useDispatch, useSelector } from "react-redux";
import {
  createPaymentQR,
  createPaymentLink,
  clearPayment,
  sendPaymentReminder,
  clearReminder,
} from "@/store/slices/paymentSlice";

export function usePayment() {
  const dispatch = useDispatch();

  const {
    qr,
    paymentLink,
    customer,
    status,
    error,
    reminderStatus,
    reminderError,
  } = useSelector((state) => state.payment);

  /** Generate QR Payment */
  const generatePayment = (payload) => {
    dispatch(createPaymentQR(payload));
  };

  /** Generate Link Payment */
  const generatePaymentLink = (payload) => {
    dispatch(createPaymentLink(payload));
  };

  /** Reset QR & Link */
  const resetPayment = () => {
    dispatch(clearPayment());
  };

  /** Send Reminder Template */
  const sendReminder = ({
    phone,
    customerName,
    amount,
    dueDate,
    storeName,
    paymentLink,
  }) => {
    console.log("usePayment - sendReminder called with:", {
      phone,
      customerName,
      amount,
      dueDate,
      storeName,
      paymentLink,
    });
    
    dispatch(
      sendPaymentReminder({
        phone,
        customerName,
        amount,
        dueDate,
        storeName,
        paymentLink,
      })
    ).unwrap();
  };

  /** Reset Reminder State after notification */
  const resetReminder = () => {
    dispatch(clearReminder());
  };

  return {
    /** QR & Payment Link STATE */
    qr,
    paymentLink,
    customer,
    status,
    error,

    /** REMINDER STATE */
    reminderStatus,
    reminderError,

    /** ACTIONS */
    generatePayment,
    generatePaymentLink,
    resetPayment,
    sendReminder,
    resetReminder,
  };
}
