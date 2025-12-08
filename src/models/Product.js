import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    price: { type: Number, required: true },
    mrp: { type: Number },
    discount: { type: Number, default: 0 },

    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true },
    weight: { type: Number },

    category: { type: String },
    brand: { type: String },

    sku: { type: String, required: true },
    barcode: { type: String },

    imageUrl: { type: String },
    gallery: [{ type: String }],

    tags: [{ type: String }],

    isActive: { type: Boolean, default: true },

    expiryDate: { type: Date },
    manufactureDate: { type: Date },
    shelfLife: { type: String },

    metadata: { type: mongoose.Schema.Types.Mixed },
    totalSold: { type: Number, default: 0 },

    organizationId: { type: String, required: true },
    userId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ organizationId: 1, sku: 1 }, { unique: true });

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
