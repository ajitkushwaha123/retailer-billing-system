import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    sellingPrice: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one order item is required",
      },
    },

    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    paymentMethod: {
      type: String,
      enum: ["cash", "online", "other"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed", "refunded"],
      default: "pending",
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },

    userId: { type: String, required: true },
    orgId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// ===== Indexes for high-performance multi-tenant filtering =====
OrderSchema.index({ orgId: 1 });
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ createdAt: -1 });

// ===== Auto-ensure subtotal fallback if missing =====
OrderSchema.pre("validate", function (next) {
  if (!this.subtotal && Array.isArray(this.items)) {
    this.subtotal = this.items.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );
  }
  next();
});

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
