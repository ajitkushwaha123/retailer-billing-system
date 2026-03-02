"use client";

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconSun,
  IconWind,
  IconCloudRain,
  IconCalendar,
} from "@tabler/icons-react";

export function WeatherSectionCards({ weather, loading }) {
  const { current_weather, forecast_features } = weather || {};

  const formatTemp = (val) =>
    typeof val === "number" ? `${val.toFixed(1)}°C` : "--";

  const yesNoBadge = (value, label) =>
    value ? (
      <Badge className="bg-green-100 text-green-700">{label}</Badge>
    ) : (
      <Badge variant="outline">No</Badge>
    );

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardDescription>Loading</CardDescription>
              <CardTitle className="text-2xl">...</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">
              Fetching weather data
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Temperature</CardDescription>
          <CardTitle className="text-2xl font-semibold">
            {formatTemp(current_weather?.temperature)}
          </CardTitle>
          <CardAction>
            {forecast_features?.is_hot_day && (
              <Badge className="bg-red-100 text-red-700">Hot Day</Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground flex gap-2">
          <IconSun size={16} />
          Avg: {formatTemp(forecast_features?.avg_temp)} • Max:{" "}
          {formatTemp(forecast_features?.max_temp)}
        </CardFooter>
      </Card>

      {/* 🌬️ Wind & Humidity */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Wind & Humidity</CardDescription>
          <CardTitle className="text-2xl font-semibold">
            {current_weather?.windspeed ?? "--"} km/h
          </CardTitle>
          <CardAction>
            {yesNoBadge(forecast_features?.is_humid_day, "Humid")}
          </CardAction>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground flex gap-2">
          <IconWind size={16} />
          Avg Humidity: {forecast_features?.avg_humidity?.toFixed(0)}%
        </CardFooter>
      </Card>

      {/* 🌦️ Rain & Condition */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Weather Condition</CardDescription>
          <CardTitle className="text-2xl font-semibold">
            {current_weather?.weather || "--"}
          </CardTitle>
          <CardAction>
            {yesNoBadge(forecast_features?.is_rainy_day, "Rain Expected")}
          </CardAction>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground flex gap-2">
          <IconCloudRain size={16} />
          Precipitation: {forecast_features?.total_precipitation} mm
        </CardFooter>
      </Card>

      {/* 📅 Day Context */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Day Context</CardDescription>
          <CardTitle className="text-2xl font-semibold capitalize">
            {forecast_features?.season || "--"}
          </CardTitle>
          <CardAction>
            {forecast_features?.is_weekend ? (
              <Badge className="bg-blue-100 text-blue-700">Weekend</Badge>
            ) : (
              <Badge variant="outline">Weekday</Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground flex gap-2">
          <IconCalendar size={16} />
          Month: {forecast_features?.month}
        </CardFooter>
      </Card>
    </div>
  );
}
