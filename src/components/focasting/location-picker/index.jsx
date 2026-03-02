"use client";

import { useEffect, useState, useRef } from "react";
export default function LocationPicker() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasAutoDetected = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("user_location");

    if (saved) {
      setLocation(JSON.parse(saved));
      return;
    }

    if (!hasAutoDetected.current) {
      hasAutoDetected.current = true;
      detectLocation();
    }
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: Number(position.coords.latitude.toFixed(6)),
          lon: Number(position.coords.longitude.toFixed(6)),
        };

        setLocation(loc);
        localStorage.setItem("user_location", JSON.stringify(loc));
        setLoading(false);
      },
      () => {
        setError("Location permission denied");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  return (
    <div className="w-full max-w-xs">
      <button
        onClick={detectLocation}
        disabled={loading}
        className="w-full rounded-lg border bg-black text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading
          ? "Detecting location..."
          : location
          ? `📍 ${location.lat}, ${location.lon}`
          : "Use my current location"}
      </button>

      {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}