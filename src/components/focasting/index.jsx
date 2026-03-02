"use client";

import React, { useEffect, useState } from "react";
import LocationPicker from "./location-picker";
import DemandBasedProducts from "./demand-based-product";
import { WeatherSectionCards } from "./weather-section-card";

const DemandForcasting = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        const saved = localStorage.getItem("user_location");
        if (!saved) {
          throw new Error("Location not set");
        }

        const { lat, lon } = JSON.parse(saved);

        const res = await fetch(
          `/api/forecasting/weather/realtime?lat=${lat}&lon=${lon}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch weather");
        }

        const data = await res.json();
        setWeather(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return (
    <div className="space-y-6 p-3">
      <WeatherSectionCards
        weather={weather}
        loading={loading}
        error={error}
      />

      <DemandBasedProducts
        weather={weather}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default DemandForcasting;