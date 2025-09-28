import mongoose from "mongoose";

const loyalitySchema = new mongoose.Schema(
  {
    _id: ObjectId,
    customerId: ObjectId,
    pointsEarned: Number,
    pointsRedeemed: Number,
    reason: String, // e.g. "Purchase", "Referral"
    invoiceId: ObjectId, // If linked to a purchase
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Loyality =
  mongoose.models.Loyality || mongoose.model("Loyality", loyalitySchema);
