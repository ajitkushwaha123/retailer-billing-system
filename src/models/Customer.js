import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    orgId: {
      type: String,
      required: true,
    },
    loyaltyPoints: { type: Number, default: 0 },
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const Customer =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);

export default Customer;
