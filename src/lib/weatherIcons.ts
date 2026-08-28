import {
  Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning, CloudSnow, CloudFog, CloudSun,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface IconInfo {
  key: string;
  Icon: LucideIcon;
}

// Map a condition string to an icon + a friendly emoji for text contexts.
export function weatherIcon(condition: string): IconInfo {
  const c = condition.toLowerCase();
  if (c.includes('clear') || c.includes('sunny')) return { key: '☀️', Icon: Sun };
  if (c.includes('partly') || c.includes('mostly clear')) return { key: '🌤️', Icon: CloudSun };
  if (c.includes('cloud') && !c.includes('rain')) return { key: '☁️', Icon: Cloud };
  if (c.includes('drizzle')) return { key: '🌦️', Icon: CloudDrizzle };
  if (c.includes('thunder') || c.includes('lightning')) return { key: '⛈️', Icon: CloudLightning };
  if (c.includes('snow')) return { key: '🌨️', Icon: CloudSnow };
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return { key: '🌫️', Icon: CloudFog };
  if (c.includes('rain') || c.includes('shower')) return { key: '🌧️', Icon: CloudRain };
  return { key: '☁️', Icon: Cloud };
}

export function conditionFromCoverage(coverage: number, humidity: number, rainP: number): string {
  if (rainP >= 81) return 'Heavy rain';
  if (rainP >= 61) return 'Rain';
  if (rainP >= 31) return 'Light drizzle';
  if (coverage >= 85) return 'Cloudy';
  if (coverage >= 50) return 'Partly cloudy';
  return 'Clear';
}
