import type { WeatherData, HourlyForecastPoint, DailyForecast } from './types';
import { conditionFromCoverage } from './weatherIcons';

// Demo cities with realistic-ish baseline climates (warm-season India).
export const DEMO_LOCATIONS = [
  { name: 'Tirupati', region: 'Andhra Pradesh, India', lat: 13.6288, lon: 79.4192 },
  { name: 'Chennai', region: 'Tamil Nadu, India', lat: 13.0827, lon: 80.2707 },
  { name: 'Hyderabad', region: 'Telangana, India', lat: 17.385, lon: 78.4867 },
  { name: 'Bengaluru', region: 'Karnataka, India', lat: 12.9716, lon: 77.5946 },
  { name: 'Vijayawada', region: 'Andhra Pradesh, India', lat: 16.5062, lon: 80.648 },
  { name: 'Visakhapatnam', region: 'Andhra Pradesh, India', lat: 17.6868, lon: 83.2185 },
];

// Seeded pseudo-random so demo data is stable per (location, hour) but varies over time.
function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function hashLocation(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function generateMockWeather(
  location: { name: string; region?: string; lat?: number; lon?: number },
  date = new Date()
): WeatherData {
  const seed = hashLocation(location.name) + date.getDate() + date.getHours();
  const r = () => seededRand(seed + Math.random() * 1000);

  const baseTemp = 28 + (r() - 0.5) * 6;
  const humidity = 55 + Math.round(r() * 40);
  const pressure = 1005 + Math.round((r() - 0.5) * 10);
  const windSpeed = 5 + Math.round(r() * 20);
  const cloudCoverage = Math.round(r() * 90);
  const rainfall = cloudCoverage > 70 && humidity > 70 ? Math.round(r() * 15 * 10) / 10 : 0;

  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const windDirection = dirs[Math.floor(r() * 8)]!;

  return {
    temperature: Math.round(baseTemp * 10) / 10,
    humidity,
    pressure,
    windSpeed,
    windDirection,
    cloudCoverage,
    rainfall,
    location: location.name,
    region: location.region,
    lat: location.lat,
    lon: location.lon,
    timestamp: date.toISOString(),
  };
}

export function generateHourlyForecast(
  base: WeatherData,
  hours = 8
): HourlyForecastPoint[] {
  const out: HourlyForecastPoint[] = [];
  const startHour = new Date(base.timestamp).getHours();
  for (let i = 0; i < hours; i++) {
    const hour = (startHour + i) % 24;
    const seed = hashLocation(base.location) + hour + new Date(base.timestamp).getDate();
    const r = () => seededRand(seed + i * 7);
    const tempDelta = Math.sin((i / hours) * Math.PI) * 3 - (i / hours) * 4;
    const temperature = Math.round((base.temperature + tempDelta + (r() - 0.5) * 2) * 10) / 10;
    // Build a rising-then-falling rain probability curve so the demo shows a clear "rain window".
    const curve = Math.max(0, Math.sin((i / hours) * Math.PI * 1.4));
    const rainProbability = Math.min(100, Math.round(curve * 90 + (r() - 0.5) * 15));
    const rainfall = rainProbability > 60 ? Math.round((rainProbability / 100) * 18 * 10) / 10 : 0;
    const condition = conditionFromCoverage(base.cloudCoverage, base.humidity, rainProbability);
    const ampm = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
    out.push({
      time: ampm,
      hour,
      temperature,
      rainProbability,
      rainfall,
      condition,
      icon: condition,
    });
  }
  return out;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function generateDailyForecast(base: WeatherData, days = 7): DailyForecast[] {
  const out: DailyForecast[] = [];
  const start = new Date(base.timestamp);
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const seed = hashLocation(base.location) + d.getDate();
    const r = () => seededRand(seed + i * 13);
    const high = Math.round((base.temperature + 2 + (r() - 0.5) * 4) * 10) / 10;
    const low = Math.round((high - 6 - r() * 4) * 10) / 10;
    const rainProbability = Math.min(100, Math.round(r() * 100));
    const rainfall = rainProbability > 60 ? Math.round((rainProbability / 100) * 20 * 10) / 10 : 0;
    const condition = conditionFromCoverage(base.cloudCoverage, base.humidity, rainProbability);
    out.push({
      day: i === 0 ? 'Today' : DAY_NAMES[d.getDay()]!,
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      icon: condition,
      condition,
      high,
      low,
      rainProbability,
      rainfall,
    });
  }
  return out;
}

// Reverse geocode a lat/lon into a city name via a deterministic fallback list.
// (We avoid external network calls in demo mode.)
export function nearestDemoCity(lat: number, lon: number): { name: string; region: string } {
  let best = DEMO_LOCATIONS[0]!;
  let bestDist = Infinity;
  for (const c of DEMO_LOCATIONS) {
    const d = Math.hypot((c.lat - lat)!, (c.lon - lon)!);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return { name: best.name, region: best.region! };
}
