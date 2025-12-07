import mongoose from "mongoose";

const AllProductSchema = new mongoose.Schema(
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

    sku: { type: String, unique: true },
    barcode: { type: String },

    imageUrl: { type: String },
    gallery: [{ type: String }],

    tags: [{ type: String }],

    isActive: { type: Boolean, default: true },

    expiryDate: { type: Date },
    manufactureDate: { type: Date },
    shelfLife: { type: String },

    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

const AllProduct =
  mongoose.models.AllProduct || mongoose.model("AllProduct", AllProductSchema);

export default AllProduct;
