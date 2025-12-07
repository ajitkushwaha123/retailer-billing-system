import mongoose from "mongoose";

const BillSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    billNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: String,
    phone: String,
    subtotal: Number,
    tax: Number,
    discount: Number,
    total: Number,
    items: [
      {
        name: String,
        quantity: Number,
        sellingPrice: Number,
        total: Number,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Bill || mongoose.model("Bill", BillSchema);
