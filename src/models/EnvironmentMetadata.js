import mongoose from "mongoose";

const EnvironmentMetadataSchema = new mongoose.Schema(
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

    /**
     * Festival identifier (country-specific)
     * Examples:
     *  - DIWALI
     *  - HOLI
     *  - EID
     *  - CHRISTMAS
     * Null if no festival on this date
     */
    festival_code: {
      type: String,
      default: null,
      index: true,
    },

    /**
     * Festival importance score
     * Scale:
     * 1 → Very low impact
     * 2 → Low impact
     * 3 → Medium impact
     * 4 → High impact
     * 5 → Very high impact (Diwali, Eid, Christmas)
     */
    festival_importance: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    /**
     * Season classification (region-dependent)
     * Suggested mapping (India):
     * - Winter   → Dec–Feb
     * - Summer   → Mar–Jun
     * - Monsoon  → Jul–Sep
     * - Autumn   → Oct–Nov
     * - Spring   → Optional (Feb–Mar)
     */
    season: {
      type: String,
      enum: ["Winter", "Summer", "Monsoon", "Spring", "Autumn"],
      required: true,
    },

    /**
     * Payday window indicator
     * True if date falls within salary period
     * Example logic:
     * - true → 28th to 3rd of next month
     * - false → rest of the days
     * Used heavily in sales forecasting
     */
    payday_window: {
      type: Boolean,
      default: false,
    },

    /**
     * Temperature category (based on daily average °C)
     * Suggested ranges:
     * - Cold     → < 10°C
     * - Mild     → 10°C – 20°C
     * - Warm     → 21°C – 30°C
     * - Hot      → 31°C – 40°C
     * - Extreme  → > 40°C
     */
    temperature_category: {
      type: String,
      enum: ["Cold", "Mild", "Warm", "Hot", "Extreme"],
      required: true,
    },

    /**
     * Rainfall in millimeters for the day
     * 0     → No rain
     * 1–10  → Light rain
     * 11–30 → Moderate rain
     * >30   → Heavy rain
     */
    rainfall_mm: {
      type: Number,
      min: 0,
      default: 0,
    },

    /**
     * Humidity level (relative humidity %)
     * Suggested mapping:
     * - Low    → < 40%
     * - Medium → 40% – 70%
     * - High   → > 70%
     */
    humidity_level: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },

    /**
     * True if officially declared public holiday
     * (Government / Bank / National holiday)
     */
    is_public_holiday: {
      type: Boolean,
      default: false,
    },

    /**
     * True if holiday + adjacent weekend
     * Examples:
     * - Friday holiday + Sat/Sun
     * - Monday holiday + Sat/Sun
     * Useful for travel, food, e-commerce spikes
     */
    is_long_weekend: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("EnvironmentMetadata", EnvironmentMetadataSchema);
