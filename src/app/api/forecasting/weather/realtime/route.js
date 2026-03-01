import { NextResponse } from "next/server";
import axios from "axios";

const WEATHER_CODE_MAP = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Drizzle: Light",
  53: "Drizzle: Moderate",
  55: "Drizzle: Dense",
  56: "Freezing Drizzle: Light",
  57: "Freezing Drizzle: Dense",
  61: "Rain: Slight",
  63: "Rain: Moderate",
  65: "Rain: Heavy",
  66: "Freezing Rain: Light",
  67: "Freezing Rain: Heavy",
  71: "Snow fall: Slight",
  73: "Snow fall: Moderate",
  75: "Snow fall: Heavy",
  77: "Snow grains",
  80: "Rain showers: Slight",
  81: "Rain showers: Moderate",
  82: "Rain showers: Violent",
  85: "Snow showers slight",
  86: "Snow showers heavy",
  95: "Thunderstorm: Slight/Moderate",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate latitude & longitude
    const lat = parseFloat(searchParams.get("lat"));
    const lon = parseFloat(searchParams.get("lon"));

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: "lat and lon must be valid numbers" },
        { status: 400 }
      );
    }

    // Build Open-Meteo URL
    // const url = `https://api.open-meteo.com/v1/forecast?latitude=28.5126746&longitude=77.1096717&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation,weathercode`
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weathercode,windspeed_10m,winddirection_10m,uv_index_0h,cloudcover_0h&daily=temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,weathercode,uv_index_max,winddirection_10m_dominant,wind_speed_10m_max,cloudcover_mean&timezone=auto`;

    const res = await axios.get(url);
    const data = res.data;

    if (!data.current_weather) {
      return NextResponse.json(
        { error: "No weather data returned" },
        { status: 500 }
      );
    }

    // Map current weather
    const c = data.current_weather;
    const currentWeather = {
      timestamp: c.time,
      temperature_c: c.temperature,
      feels_like_c: c.apparent_temperature,
      wind_speed_kmh: c.windspeed,
      wind_deg: c.winddirection,
      weather_description: WEATHER_CODE_MAP[c.weathercode] ?? "Unknown",
    };

    return NextResponse.json({ currentWeather });
  } catch (err) {
    console.error("Error fetching weather:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch weather from Open-Meteo" },
      { status: 500 }
    );
  }
}