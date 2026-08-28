export interface WeatherData {
  temperature: number; // °C
  humidity: number; // %
  pressure: number; // hPa
  windSpeed: number; // km/h
  windDirection: string;
  cloudCoverage: number; // %
  rainfall: number; // mm (previous/current)
  location: string;
  region?: string;
  lat?: number;
  lon?: number;
  timestamp: string;
}

export interface PredictionResult {
  rainProbability: number; // 0-100
  prediction: string; // "No significant rain" | "Low chance" | "Rain likely" | "Heavy rain warning"
  expectedRainfall: number; // mm
  rainfallIntensity: 'none' | 'light' | 'moderate' | 'heavy' | 'very heavy';
  alertSeverity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  expectedTimeWindow?: string;
  explanation: string;
  modelVersion: string;
  input: WeatherData;
}

export interface HourlyForecastPoint {
  time: string; // "1 PM"
  hour: number;
  temperature: number;
  rainProbability: number;
  rainfall: number;
  condition: string;
  icon: string;
}

export interface DailyForecast {
  day: string;
  date: string;
  icon: string;
  condition: string;
  high: number;
  low: number;
  rainProbability: number;
  rainfall: number;
}

export interface SavedLocation {
  id?: string;
  name: string;
  region?: string;
  lat?: number;
  lon?: number;
  is_primary?: boolean;
  created_at?: string;
}

export interface AlertRow {
  id: string;
  user_id?: string;
  location_name: string;
  message: string;
  rain_probability: number;
  rainfall: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'unread' | 'read';
  created_at: string;
}

export interface NotificationSettings {
  id?: string;
  enabled: boolean;
  min_probability: number;
  min_rainfall: number;
  lead_time_minutes: number;
  updated_at?: string;
}

export interface WeatherHistoryRow {
  id?: string;
  location_name: string;
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction?: string;
  cloud_coverage: number;
  rainfall: number;
  rain_probability?: number;
  recorded_at: string;
}

export type Page = 'dashboard' | 'forecast' | 'prediction' | 'alerts' | 'history' | 'settings';
