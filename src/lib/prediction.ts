import type { WeatherData, PredictionResult } from './types';

/**
 * Rule-based rainfall prediction engine.
 *
 * This is intentionally modular: the `predict` function is the single entry point
 * the UI calls. A trained ML model (Random Forest / Logistic Regression served via
 * an edge function) can later replace the body of `predict` without touching callers.
 */

export interface PredictionInput {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  cloudCoverage: number;
  previousRainfall: number;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function category(probability: number): string {
  if (probability <= 30) return 'No significant rain';
  if (probability <= 60) return 'Low chance of rain';
  if (probability <= 80) return 'Rain likely';
  return 'Heavy rain warning';
}

function intensityFor(probability: number, rainfall: number): PredictionResult['rainfallIntensity'] {
  if (probability < 31) return 'none';
  if (rainfall < 2.5) return 'light';
  if (rainfall < 7.5) return 'moderate';
  if (rainfall < 15) return 'heavy';
  return 'very heavy';
}

function severityFor(probability: number, rainfall: number): PredictionResult['alertSeverity'] {
  if (probability >= 90 && rainfall >= 20) return 'critical';
  if (probability >= 80 && rainfall >= 10) return 'high';
  if (probability >= 70) return 'medium';
  if (probability >= 31) return 'low';
  return 'none';
}

function explain(input: PredictionInput, probability: number): string {
  const parts: string[] = [];
  if (input.humidity >= 70) parts.push('high humidity');
  if (input.cloudCoverage >= 70) parts.push('high cloud coverage');
  if (input.pressure < 1008) parts.push('falling atmospheric pressure');
  if (input.previousRainfall > 5) parts.push('recent rainfall');
  if (input.windSpeed >= 15) parts.push('strong winds');
  if (parts.length === 0) {
    return `Low humidity, clear skies, and stable pressure indicate a low probability of rainfall (${Math.round(probability)}%).`;
  }
  return `${parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' + ')} indicate an increased probability of rainfall (${Math.round(probability)}%).`;
}

function expectedTimeWindow(probability: number, now = new Date()): string {
  if (probability < 31) return 'No rain expected';
  const start = new Date(now.getTime() + 60 * 60 * 1000);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function predict(input: PredictionInput, weather?: WeatherData): PredictionResult {
  // Weighted rule-based score. Each contributor is normalized to a 0-100 sub-score.
  const humidityScore = clamp((input.humidity - 40) / 60, 0, 1) * 32;
  const cloudScore = clamp(input.cloudCoverage / 100, 0, 1) * 28;
  // Lower pressure → higher rain chance. 1020 = 0, 995 = max.
  const pressureScore = clamp((1020 - input.pressure) / 25, 0, 1) * 22;
  const windScore = clamp(input.windSpeed / 30, 0, 1) * 8;
  const priorRainScore = clamp(input.previousRainfall / 20, 0, 1) * 10;

  let probability = humidityScore + cloudScore + pressureScore + windScore + priorRainScore;
  probability = clamp(Math.round(probability), 0, 100);

  // Expected rainfall scales with probability and humidity/cloud cover.
  const expectedRainfall =
    probability < 31
      ? 0
      : Math.round((probability / 100) * (input.humidity / 100 + input.cloudCoverage / 200) * 25 * 10) / 10;

  return {
    rainProbability: probability,
    prediction: category(probability),
    expectedRainfall,
    rainfallIntensity: intensityFor(probability, expectedRainfall),
    alertSeverity: severityFor(probability, expectedRainfall),
    expectedTimeWindow: expectedTimeWindow(probability),
    explanation: explain(input, probability),
    modelVersion: 'rule-based-v1',
    input: weather ?? {
      temperature: input.temperature,
      humidity: input.humidity,
      pressure: input.pressure,
      windSpeed: input.windSpeed,
      windDirection: '',
      cloudCoverage: input.cloudCoverage,
      rainfall: input.previousRainfall,
      location: '',
      timestamp: new Date().toISOString(),
    },
  };
}

// Demo / sample model-performance metrics. Clearly labeled as sample in the UI.
export const SAMPLE_MODEL_METRICS = {
  accuracy: 87,
  precision: 84,
  recall: 89,
  f1: 86,
  confusionMatrix: {
    truePositive: 89,
    falsePositive: 17,
    falseNegative: 11,
    trueNegative: 83,
  },
};
