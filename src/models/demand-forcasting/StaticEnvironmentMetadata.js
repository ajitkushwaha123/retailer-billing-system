import mongoose from "mongoose";

const StaticEnvironmentSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },
    day_of_week: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    month: {
      type: String,
      enum: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      required: true,
    },
    is_weekend: {
      type: Boolean,
      default: false,
    },
    festival_code: {
      type: String,
      default: null,
      index: true,
    },
    festival_importance: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    season: {
      type: String,
      enum: ["Winter", "Summer", "Monsoon", "Spring", "Autumn"],
      required: true,
    },
    payday_window: {
      type: Boolean,
      default: false,
    },
    is_public_holiday: {
      type: Boolean,
      default: false,
    },
    is_long_weekend: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("StaticEnvironment", StaticEnvironmentSchema);