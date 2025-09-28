import mongoose from "mongoose";

const paymentHistorySchema = new mongoose.Schema(
  {
    _id: ObjectId,
    customerId: ObjectId,
    invoiceId: ObjectId,
    amount: Number,
    mode: {
      type: String,
      enum: ["Cash", "Card", "UPI", "NetBanking", "Wallet"],
    },
    transactionId: String,
  },
  { timestamps: true }
);

export const PaymentHistory =
  mongoose.models.PaymentHistory ||
  mongoose.model("PaymentHistory", paymentHistorySchema);
