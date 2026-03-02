export function extractDemandSignals(forecast){
  const signals = [];

  if (forecast.is_hot_day) signals.push("HOT_WEATHER");
  if (forecast.is_cold_day) signals.push("COLD_WEATHER");
  if (forecast.is_rainy_day) signals.push("RAINY_WEATHER");
  if (forecast.is_humid_day) signals.push("HUMID_WEATHER");

  signals.push(forecast.is_weekend ? "WEEKEND" : "WEEKDAY");

  if (forecast.season) {
    signals.push(forecast.season.toUpperCase());
  }

  signals.push("ALL_SEASON");
  signals.push("DAILY_CONSUMPTION");

  return [...new Set(signals)];
}