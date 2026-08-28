import { supabase } from './supabase';
import type {
  SavedLocation, AlertRow, NotificationSettings, WeatherHistoryRow, PredictionResult,
} from './types';

// ---- Locations ----
export async function fetchLocations(): Promise<SavedLocation[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as SavedLocation[];
}

export async function addLocation(loc: Omit<SavedLocation, 'id' | 'created_at'>): Promise<SavedLocation> {
  const { data, error } = await supabase
    .from('locations')
    .insert(loc)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as SavedLocation;
}

export async function setPrimaryLocation(id: string): Promise<void> {
  // Unset all, then set the chosen one.
  const { error: e1 } = await supabase.from('locations').update({ is_primary: false }).neq('id', '00000000-0000-0000-0000-000000000000');
  if (e1) throw e1;
  const { error: e2 } = await supabase.from('locations').update({ is_primary: true }).eq('id', id);
  if (e2) throw e2;
}

export async function deleteLocation(id: string): Promise<void> {
  const { error } = await supabase.from('locations').delete().eq('id', id);
  if (error) throw error;
}

// ---- Alerts ----
export async function fetchAlerts(): Promise<AlertRow[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AlertRow[];
}

export async function createAlert(a: Omit<AlertRow, 'id' | 'created_at' | 'user_id'>): Promise<AlertRow> {
  const { data, error } = await supabase
    .from('alerts')
    .insert(a)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as AlertRow;
}

export async function markAlertRead(id: string): Promise<void> {
  const { error } = await supabase.from('alerts').update({ status: 'read' }).eq('id', id);
  if (error) throw error;
}

export async function deleteAlert(id: string): Promise<void> {
  const { error } = await supabase.from('alerts').delete().eq('id', id);
  if (error) throw error;
}

// ---- Notification settings ----
export async function getNotificationSettings(): Promise<NotificationSettings | null> {
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data as NotificationSettings | null;
}

export async function upsertNotificationSettings(s: Omit<NotificationSettings, 'id' | 'updated_at'>): Promise<NotificationSettings> {
  const { data, error } = await supabase
    .from('notification_settings')
    .upsert(s, { onConflict: 'user_id' })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as NotificationSettings;
}

// ---- Weather history ----
export async function fetchWeatherHistory(rangeHours: number): Promise<WeatherHistoryRow[]> {
  const since = new Date(Date.now() - rangeHours * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('weather_history')
    .select('*')
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as WeatherHistoryRow[];
}

export async function addWeatherHistory(row: Omit<WeatherHistoryRow, 'id'>): Promise<void> {
  const { error } = await supabase.from('weather_history').insert(row);
  if (error) throw error;
}

// ---- Predictions (saved for history/accuracy) ----
export async function savePrediction(
  locationName: string,
  p: PredictionResult
): Promise<void> {
  const { error } = await supabase.from('predictions').insert({
    location_name: locationName,
    rain_probability: p.rainProbability,
    prediction: p.prediction,
    expected_rainfall: p.expectedRainfall,
    rainfall_intensity: p.rainfallIntensity,
    alert_severity: p.alertSeverity,
    model_version: p.modelVersion,
    input: p.input,
  });
  if (error) throw error;
}

export async function fetchRecentPredictions(limit = 50) {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
