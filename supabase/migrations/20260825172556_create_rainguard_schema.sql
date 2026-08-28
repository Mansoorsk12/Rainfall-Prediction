/*
# RainGuard schema (multi-user, owner-scoped)

1. Purpose
   RainGuard stores each user's saved locations, weather predictions, rain alerts,
   weather history snapshots, and per-user notification settings. Each user only
   ever sees their own rows.

2. New Tables
   - `locations`
     - id uuid PK
     - user_id uuid NOT NULL DEFAULT auth.uid() (owner)
     - name text NOT NULL (display name, e.g. "Tirupati")
     - region text (e.g. "Andhra Pradesh, India")
     - lat double precision
     - lon double precision
     - is_primary boolean DEFAULT false (the user's default location)
     - created_at timestamptz DEFAULT now()
   - `predictions`
     - id uuid PK
     - user_id uuid NOT NULL DEFAULT auth.uid()
     - location_name text NOT NULL
     - rain_probability double precision NOT NULL (0-100)
     - prediction text NOT NULL (e.g. "Rain likely")
     - expected_rainfall double precision (mm)
     - rainfall_intensity text
     - alert_severity text
     - model_version text NOT NULL DEFAULT 'rule-based-v1'
     - input jsonb (the weather inputs used)
     - created_at timestamptz DEFAULT now()
   - `alerts`
     - id uuid PK
     - user_id uuid NOT NULL DEFAULT auth.uid()
     - location_name text NOT NULL
     - message text NOT NULL
     - rain_probability double precision NOT NULL
     - rainfall double precision NOT NULL DEFAULT 0
     - severity text NOT NULL DEFAULT 'medium'
     - status text NOT NULL DEFAULT 'unread' (unread | read)
     - created_at timestamptz DEFAULT now()
   - `weather_history`
     - id uuid PK
     - user_id uuid NOT NULL DEFAULT auth.uid()
     - location_name text NOT NULL
     - temperature double precision
     - humidity double precision
     - pressure double precision
     - wind_speed double precision
     - wind_direction text
     - cloud_coverage double precision
     - rainfall double precision DEFAULT 0
     - rain_probability double precision
     - recorded_at timestamptz NOT NULL DEFAULT now()
   - `notification_settings`
     - id uuid PK
     - user_id uuid NOT NULL UNIQUE DEFAULT auth.uid()
     - enabled boolean NOT NULL DEFAULT true
     - min_probability double precision NOT NULL DEFAULT 70
     - min_rainfall double precision NOT NULL DEFAULT 5
     - lead_time_minutes int NOT NULL DEFAULT 60
     - updated_at timestamptz DEFAULT now()

3. Security
   - RLS enabled on every table.
   - Owner-scoped CRUD via auth.uid() = user_id for all tables.
   - notification_settings is 1:1 with the user (unique user_id).

4. Notes
   - user_id defaults to auth.uid() so client inserts that omit user_id succeed.
   - All tables are owner-scoped; no shared/public data.
*/

CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  region text,
  lat double precision,
  lon double precision,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_locations" ON locations;
CREATE POLICY "select_own_locations" ON locations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_locations" ON locations;
CREATE POLICY "insert_own_locations" ON locations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_locations" ON locations;
CREATE POLICY "update_own_locations" ON locations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_locations" ON locations;
CREATE POLICY "delete_own_locations" ON locations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  location_name text NOT NULL,
  rain_probability double precision NOT NULL,
  prediction text NOT NULL,
  expected_rainfall double precision NOT NULL DEFAULT 0,
  rainfall_intensity text,
  alert_severity text,
  model_version text NOT NULL DEFAULT 'rule-based-v1',
  input jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_predictions" ON predictions;
CREATE POLICY "select_own_predictions" ON predictions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_predictions" ON predictions;
CREATE POLICY "insert_own_predictions" ON predictions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_predictions" ON predictions;
CREATE POLICY "update_own_predictions" ON predictions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_predictions" ON predictions;
CREATE POLICY "delete_own_predictions" ON predictions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  location_name text NOT NULL,
  message text NOT NULL,
  rain_probability double precision NOT NULL,
  rainfall double precision NOT NULL DEFAULT 0,
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'unread',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_alerts" ON alerts;
CREATE POLICY "select_own_alerts" ON alerts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_alerts" ON alerts;
CREATE POLICY "insert_own_alerts" ON alerts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_alerts" ON alerts;
CREATE POLICY "update_own_alerts" ON alerts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_alerts" ON alerts;
CREATE POLICY "delete_own_alerts" ON alerts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS weather_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  location_name text NOT NULL,
  temperature double precision,
  humidity double precision,
  pressure double precision,
  wind_speed double precision,
  wind_direction text,
  cloud_coverage double precision,
  rainfall double precision NOT NULL DEFAULT 0,
  rain_probability double precision,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE weather_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_weather_history" ON weather_history;
CREATE POLICY "select_own_weather_history" ON weather_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_weather_history" ON weather_history;
CREATE POLICY "insert_own_weather_history" ON weather_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_weather_history" ON weather_history;
CREATE POLICY "update_own_weather_history" ON weather_history FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_weather_history" ON weather_history;
CREATE POLICY "delete_own_weather_history" ON weather_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  min_probability double precision NOT NULL DEFAULT 70,
  min_rainfall double precision NOT NULL DEFAULT 5,
  lead_time_minutes int NOT NULL DEFAULT 60,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notification_settings" ON notification_settings;
CREATE POLICY "select_own_notification_settings" ON notification_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notification_settings" ON notification_settings;
CREATE POLICY "insert_own_notification_settings" ON notification_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notification_settings" ON notification_settings;
CREATE POLICY "update_own_notification_settings" ON notification_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notification_settings" ON notification_settings;
CREATE POLICY "delete_own_notification_settings" ON notification_settings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_locations_user ON locations(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_history_user ON weather_history(user_id, recorded_at DESC);
