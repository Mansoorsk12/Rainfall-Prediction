import { Loader2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import type { WeatherBundle } from '@/hooks/useWeather';
import { weatherIcon } from '@/lib/weatherIcons';
import WeatherIcon from '@/components/WeatherIcon';

interface ForecastProps {
  data: WeatherBundle | null;
  loading: boolean;
}

export default function Forecast({ data, loading }: ForecastProps) {
  if (loading && !data) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }
  if (!data) return null;

  const { hourly, daily } = data;
  const tempData = hourly.map((h) => ({ time: h.time, temp: h.temperature, prob: h.rainProbability }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Forecast</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Hourly and 7-day outlook</p>
      </div>

      {/* Temperature + rain chart */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Temperature &amp; Rain Probability</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tempData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="t" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="°" />
              <YAxis yAxisId="p" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} />
              <Area yAxisId="t" type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} fill="url(#tempGrad)" name="Temp °C" />
              <Area yAxisId="p" type="monotone" dataKey="prob" stroke="#06b6d4" strokeWidth={2} fill="url(#rainGrad)" name="Rain %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly detail */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Hourly Detail</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {hourly.map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{h.time}</span>
              <WeatherIcon condition={h.condition} className="w-7 h-7 text-blue-500" />
              <span className="text-sm font-semibold text-slate-800 dark:text-white">{Math.round(h.temperature)}°C</span>
              <span className="text-xs text-blue-600 dark:text-blue-400">{h.rainProbability}%</span>
              <span className="text-xs text-slate-400">{h.rainfall}mm</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-day */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4">7-Day Forecast</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {daily.map((d, i) => {
            const { Icon } = weatherIcon(d.condition);
            return (
              <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{d.day}</p>
                    <p className="text-xs text-slate-400">{d.date}</p>
                  </div>
                  <Icon className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mb-2">{d.condition}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-800 dark:text-white">{Math.round(d.high)}°</span>
                  <span className="text-slate-400">{Math.round(d.low)}°</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-400">Rain</span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.rainProbability}%`, background: d.rainProbability > 60 ? '#06b6d4' : '#94a3b8' }} />
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{d.rainProbability}%</span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">{d.rainfall}mm expected</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
