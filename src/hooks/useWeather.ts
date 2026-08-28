import { useEffect, useState, useCallback } from 'react';
import { generateMockWeather, generateHourlyForecast, generateDailyForecast } from '@/lib/mockWeather';
import { predict } from '@/lib/prediction';
import { addWeatherHistory, savePrediction, createAlert, getNotificationSettings } from '@/lib/dataService';
import type { WeatherData, PredictionResult, HourlyForecastPoint, DailyForecast, SavedLocation } from '@/lib/types';

export interface WeatherBundle {
  current: WeatherData;
  prediction: PredictionResult;
  hourly: HourlyForecastPoint[];
  daily: DailyForecast[];
}

export function useWeather(location: SavedLocation | null, demoMode: boolean): {
  data: WeatherBundle | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [data, setData] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!location) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const now = new Date();
        const current = generateMockWeather(location, now);
        const prediction = predict({
          temperature: current.temperature,
          humidity: current.humidity,
          pressure: current.pressure,
          windSpeed: current.windSpeed,
          cloudCoverage: current.cloudCoverage,
          previousRainfall: current.rainfall,
        }, current);
        const hourly = generateHourlyForecast(current);
        const daily = generateDailyForecast(current);

        if (!cancelled) {
          setData({ current, prediction, hourly, daily });
          setLoading(false);
        }

        // Persist history + prediction + alert in the background (demo mode still persists).
        try {
          await addWeatherHistory({
            location_name: location.name,
            temperature: current.temperature,
            humidity: current.humidity,
            pressure: current.pressure,
            wind_speed: current.windSpeed,
            wind_direction: current.windDirection,
            cloud_coverage: current.cloudCoverage,
            rainfall: current.rainfall,
            rain_probability: prediction.rainProbability,
            recorded_at: now.toISOString(),
          });
          await savePrediction(location.name, prediction);

          // Alert generation based on user settings.
          const settings = await getNotificationSettings();
          const minProb = settings?.min_probability ?? 70;
          const minRain = settings?.min_rainfall ?? 5;
          if (
            prediction.rainProbability >= minProb &&
            prediction.expectedRainfall >= minRain &&
            prediction.alertSeverity !== 'none'
          ) {
            await createAlert({
              location_name: location.name,
              message: `Rain is expected in ${location.name} within the next ${settings?.lead_time_minutes ?? 60} minutes.`,
              rain_probability: prediction.rainProbability,
              rainfall: prediction.expectedRainfall,
              severity: prediction.alertSeverity,
              status: 'unread',
            });
          }
        } catch {
          // Persistence is best-effort; UI still shows data.
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to retrieve weather data.');
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.name, demoMode, tick]);

  // Auto-refresh every 15 minutes.
  useEffect(() => {
    if (!location) return;
    const id = setInterval(refresh, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, [location, refresh]);

  return { data, loading, error, refresh };
}
