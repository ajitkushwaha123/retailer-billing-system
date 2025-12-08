import mongoose from "mongoose";

const BarcodeReaderSchema = new mongoose.Schema(
  {
    barcode: String,
  },
  { timestamps: true }
);

export default mongoose.models.BarcodeReader ||
  mongoose.model("BarcodeReader", BarcodeReaderSchema);
