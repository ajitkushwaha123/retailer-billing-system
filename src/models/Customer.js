import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    email: String,
    billingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },
    shippingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },
    loyaltyPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export const Customer =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);
