import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    _id: ObjectId,
    invoiceNumber: String,
    customerId: ObjectId,
    date: { type: Date, default: Date.now },
    items: [
      {
        productId: ObjectId,
        name: String,
        quantity: Number,
        unitPrice: Number,
        discount: { type: Number, default: 0 },
        taxRate: Number,
        total: Number,
      },
    ],
    summary: {
      subTotal: Number,
      discountTotal: Number,
      taxTotal: Number,
      grandTotal: Number,
    },
    payment: {
      mode: {
        type: String,
        enum: ["Cash", "Card", "UPI", "NetBanking", "Wallet", "Credit"],
      },
      transactionId: String,
      status: {
        type: String,
        enum: ["Paid", "Pending", "Partial"],
        default: "Paid",
      },
      paidAmount: Number,
      balanceAmount: Number,
    },
    notes: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Invoice =
  mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
