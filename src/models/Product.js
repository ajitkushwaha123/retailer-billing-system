import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g. "Amul Milk"
    description: { type: String },

    price: { type: Number, required: true }, // selling price
    mrp: { type: Number }, // optional MRP (Maximum Retail Price)
    discount: { type: Number, default: 0 }, // discount in %

    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true }, // e.g. "kg", "g", "L", "ml", "pcs"
    weight: { type: Number }, // numeric weight/volume (e.g. 500)

    category: { type: String }, // e.g. "Dairy", "Vegetables"
    brand: { type: String }, // e.g. "Amul"

    sku: { type: String, unique: true },
    barcode: { type: String }, // optional barcode / UPC

    imageUrl: { type: String },
    gallery: [{ type: String }], // multiple images

    tags: [{ type: String }],

    isActive: { type: Boolean, default: true },

    expiryDate: { type: Date }, 
    manufactureDate: { type: Date },
    shelfLife: { type: String }, 

    metadata: { type: mongoose.Schema.Types.Mixed },

    organizationId: { type: String, required: true },
    userId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
