import { useEffect, useState } from 'react';
import { Loader2, History as HistoryIcon, TrendingUp, Target, Crosshair } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import type { WeatherHistoryRow } from '@/lib/types';
import { fetchWeatherHistory } from '@/lib/dataService';
import { SAMPLE_MODEL_METRICS } from '@/lib/prediction';

type Range = '24h' | '7d' | '30d';

export default function History() {
  const [rows, setRows] = useState<WeatherHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>('24h');

  const rangeHours = range === '24h' ? 24 : range === '7d' ? 168 : 720;

  useEffect(() => {
    setLoading(true);
    fetchWeatherHistory(rangeHours)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [rangeHours]);

  const chartData = rows.map((r) => ({
    time: new Date(r.recorded_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: range === '24h' ? 'numeric' : undefined, minute: range === '24h' ? '2-digit' : undefined }),
    temp: r.temperature,
    humidity: r.humidity,
    pressure: r.pressure,
    rainfall: r.rainfall,
    prob: r.rain_probability,
  }));

  const { accuracy, precision, recall, f1, confusionMatrix } = SAMPLE_MODEL_METRICS;
  const metrics = [
    { name: 'Accuracy', value: accuracy, fill: '#3b82f6' },
    { name: 'Precision', value: precision, fill: '#06b6d4' },
    { name: 'Recall', value: recall, fill: '#10b981' },
    { name: 'F1 Score', value: f1, fill: '#f59e0b' },
  ];
  const confusion = [
    { label: 'True Positive', value: confusionMatrix.truePositive, color: '#10b981' },
    { label: 'False Positive', value: confusionMatrix.falsePositive, color: '#f59e0b' },
    { label: 'False Negative', value: confusionMatrix.falseNegative, color: '#f59e0b' },
    { label: 'True Negative', value: confusionMatrix.trueNegative, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Weather History</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Historical weather &amp; prediction data</p>
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
          {(['24h', '7d', '30d'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${range === r ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow' : 'text-slate-500'}`}
            >
              {r === '24h' ? '24 Hours' : r === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : rows.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HistoryIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No history yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Weather data is recorded automatically as you use the dashboard. Check back after a while.</p>
        </div>
      ) : (
        <>
          <ChartCard title="Temperature (°C)" data={chartData} dataKey="temp" color="#f59e0b" unit="°C" />
          <ChartCard title="Humidity (%)" data={chartData} dataKey="humidity" color="#06b6d4" unit="%" />
          <ChartCard title="Atmospheric Pressure (hPa)" data={chartData} dataKey="pressure" color="#8b5cf6" unit="hPa" />
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Rain Probability &amp; Rainfall</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis yAxisId="p" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="mm" />
                  <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                  <Line yAxisId="p" type="monotone" dataKey="prob" stroke="#06b6d4" strokeWidth={2} dot={false} name="Rain %" />
                  <Line yAxisId="r" type="monotone" dataKey="rainfall" stroke="#3b82f6" strokeWidth={2} dot={false} name="Rainfall mm" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* AI Model Performance */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">AI Model Performance</h2>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">⚠ These are demo/sample metrics, not real model performance.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radial metrics */}
          <div className="lg:col-span-1">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="25%" outerRadius="100%" data={metrics} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={8} />
                  <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {metrics.map((m) => (
                <div key={m.name} className="text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{m.name}</p>
                  <p className="text-lg font-bold" style={{ color: m.fill }}>{m.value}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Confusion matrix */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Crosshair className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Confusion Matrix (sample)</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {confusion.map((c) => (
                <div key={c.label} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{c.label}</p>
                  <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
                </div>
              ))}
            </div>
            <div className="h-40 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confusion} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(148,163,184,0.1)' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {confusion.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, data, dataKey, color, unit }: { title: string; data: Record<string, number | string>[]; dataKey: string; color: string; unit: string }) {
  return (
    <div className="glass-card p-6">
      <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4">{title}</h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit={unit} />
            <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
