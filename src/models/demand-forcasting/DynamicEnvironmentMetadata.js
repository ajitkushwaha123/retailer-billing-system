import mongoose from "mongoose";

const DynamicEnvironmentSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    temperature_c: {
      type: Number,
      required: true,
    },
    rainfall_mm: {
      type: Number,
      required: true,
    },
    humidity_percent: {
      type: Number,
      required: true,
    },
    weather_description: {
      type: String,
      default: null,
    },
    wind_speed_kmh: {
      type: Number,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("DynamicEnvironment", DynamicEnvironmentSchema);
