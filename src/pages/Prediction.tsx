import { Loader2, BrainCircuit, Droplets, Wind, Gauge, Cloud, CloudRain, Sparkles } from 'lucide-react';
import type { WeatherBundle } from '@/hooks/useWeather';
import CircularProgress from '@/components/CircularProgress';

interface PredictionProps {
  data: WeatherBundle | null;
  loading: boolean;
}

export default function Prediction({ data, loading }: PredictionProps) {
  if (loading && !data) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }
  if (!data) return null;

  const { current, prediction } = data;
  const inputs = [
    { icon: Droplets, label: 'Humidity', value: `${current.humidity}%` },
    { icon: Gauge, label: 'Pressure', value: `${current.pressure} hPa` },
    { icon: Wind, label: 'Wind Speed', value: `${current.windSpeed} km/h` },
    { icon: Cloud, label: 'Cloud Cover', value: `${current.cloudCoverage}%` },
    { icon: CloudRain, label: 'Previous Rainfall', value: `${current.rainfall} mm` },
    { icon: Sparkles, label: 'Temperature', value: `${current.temperature}°C` },
  ];

  const severityColor = prediction.rainProbability <= 30 ? '#10b981' : prediction.rainProbability <= 60 ? '#f59e0b' : prediction.rainProbability <= 80 ? '#3b82f6' : '#ef4444';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Rainfall Prediction</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Rule-based model (ML-ready architecture)</p>
      </div>

      {/* Input parameters */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Input Parameters</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {inputs.map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
              <Icon className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prediction result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl" style={{ background: `${severityColor}20` }} />
          <div className="flex items-center gap-2 mb-4 relative">
            <BrainCircuit className="w-5 h-5 text-blue-500" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Prediction</p>
          </div>
          <CircularProgress value={prediction.rainProbability} size={180} label="rain probability" />
          <div className="mt-5 text-center relative">
            <p className="text-2xl font-bold" style={{ color: severityColor }}>{prediction.prediction}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Expected rainfall: {prediction.expectedRainfall} mm</p>
            <p className="text-xs text-slate-400 mt-0.5">Intensity: {prediction.rainfallIntensity}</p>
            <p className="text-xs text-slate-400 mt-0.5">Expected time: {prediction.expectedTimeWindow}</p>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-3">Why this prediction?</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{prediction.explanation}</p>

          <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">Severity Levels</h3>
            <div className="space-y-2">
              {[
                { range: '0–30%', label: 'No significant rain', color: '#10b981' },
                { range: '31–60%', label: 'Low chance', color: '#f59e0b' },
                { range: '61–80%', label: 'Rain likely', color: '#3b82f6' },
                { range: '81–100%', label: 'Heavy rain warning', color: '#ef4444' },
              ].map((s) => (
                <div key={s.range} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 w-20">{s.range}</span>
                  <span className="text-sm text-slate-700 dark:text-slate-200">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-700/50">
            <p className="text-xs text-slate-400">Model version: <span className="font-mono">{prediction.modelVersion}</span></p>
            <p className="text-xs text-slate-400 mt-1">Designed so a trained Random Forest or Logistic Regression model can replace the prediction logic without UI changes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
