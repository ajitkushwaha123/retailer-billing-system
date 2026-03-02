import { NextResponse } from "next/server";
import axios from "axios";

const WEATHER_CODE_MAP = {
  0: "Clear",
  1: "Mostly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Drizzle",
  53: "Drizzle",
  55: "Drizzle",
  61: "Rain",
  63: "Rain",
  65: "Heavy Rain",
  80: "Rain Showers",
  81: "Rain Showers",
  82: "Heavy Rain Showers",
  95: "Thunderstorm",
};

const getSeason = (month) => {
  if ([12, 1, 2].includes(month)) return "winter";
  if ([3, 4, 5].includes(month)) return "summer";
  if ([6, 7, 8].includes(month)) return "monsoon";
  return "post_monsoon";
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = Number(searchParams.get("lat"));
    const lon = Number(searchParams.get("lon"));

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return NextResponse.json(
        { error: "lat and lon must be valid numbers" },
        { status: 400 }
      );
    }

    const url = `https://api.open-meteo.com/v1/forecast
      ?latitude=${lat}
      &longitude=${lon}
      &current_weather=true
      &hourly=temperature_2m,relative_humidity_2m,precipitation,weathercode
      &timezone=auto`.replace(/\s+/g, "");

    const { data } = await axios.get(url);

    const hours = data.hourly.time.length;

    const avgTemp =
      data.hourly.temperature_2m.reduce((a, b) => a + b, 0) / hours;

    const maxTemp = Math.max(...data.hourly.temperature_2m);
    const minTemp = Math.min(...data.hourly.temperature_2m);

    const avgHumidity =
      data.hourly.relative_humidity_2m.reduce((a, b) => a + b, 0) / hours;

    const totalPrecipitation = data.hourly.precipitation.reduce(
      (a, b) => a + b,
      0
    );

    const weatherCodes = data.hourly.weathercode;
    const rainyDay = weatherCodes.some((c) => c >= 61 && c <= 82);

    const now = new Date(data.current_weather.time);
    const dayOfWeek = now.getDay(); 
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const month = now.getMonth() + 1;
    const season = getSeason(month);

    const forecastFeatures = {
      avg_temp: Number(avgTemp.toFixed(2)),
      max_temp: maxTemp,
      min_temp: minTemp,
      avg_humidity: Number(avgHumidity.toFixed(2)),
      total_precipitation: totalPrecipitation,

      is_hot_day: maxTemp >= 32,
      is_cold_day: avgTemp <= 15,
      is_humid_day: avgHumidity >= 75,
      is_rainy_day: rainyDay,

      day_of_week: dayOfWeek,
      is_weekend: isWeekend,
      month,
      season,
    };

    return NextResponse.json({
      location: { lat, lon },
      current_weather: {
        temperature: data.current_weather.temperature,
        windspeed: data.current_weather.windspeed,
        weather: WEATHER_CODE_MAP[data.current_weather.weathercode] ?? "Unknown",
      },
      forecast_features: forecastFeatures,
    });
  } catch (error) {
    console.error("Weather API error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch or process weather data" },
      { status: 500 }
    );
  }
}