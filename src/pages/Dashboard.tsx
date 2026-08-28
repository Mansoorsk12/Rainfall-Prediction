import { RefreshCw, Loader2, AlertTriangle, Droplets, Wind, Gauge, Cloud, MapPin } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import type { WeatherBundle } from '@/hooks/useWeather';
import { weatherIcon } from '@/lib/weatherIcons';
import CircularProgress from '@/components/CircularProgress';
import WeatherIcon from '@/components/WeatherIcon';

interface DashboardProps {
  data: WeatherBundle | null;
  loading: boolean;
  error: string | null;
  locationName: string;
  onRefresh: () => void;
}

function severityClasses(prob: number): string {
  if (prob <= 30) return 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20';
  if (prob <= 60) return 'from-amber-500/10 to-amber-500/5 border-amber-500/20';
  if (prob <= 80) return 'from-blue-500/10 to-blue-500/5 border-blue-500/20';
  return 'from-red-500/10 to-red-500/5 border-red-500/20';
}

export default function Dashboard({ data, loading, error, locationName, onRefresh }: DashboardProps) {
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="glass-card p-8 text-center max-w-md mx-auto mt-12">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Unable to retrieve weather data</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{error}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Please check your internet connection and try again.</p>
        <button onClick={onRefresh} className="btn-primary inline-flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Try again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { current, prediction, hourly, daily } = data;
  const { Icon: CondIcon } = weatherIcon(current.rainfall > 0 ? 'Rain' : 'Cloudy');
  const rainChart = hourly.map((h) => ({ time: h.time, prob: h.rainProbability, temp: h.temperature }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top row: current weather + rain prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current weather */}
        <div className="lg:col-span-2 glass-card p-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="flex items-start justify-between mb-6 relative">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Weather</p>
              <div className="flex items-center gap-1.5 mt-1 text-slate-600 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-sm">{locationName}</span>
              </div>
            </div>
            <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-6 relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-400/10 flex items-center justify-center">
              <CondIcon className="w-14 h-14 text-blue-500" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-bold text-slate-900 dark:text-white">{Math.round(current.temperature)}</span>
                <span className="text-2xl font-medium text-slate-400">°C</span>
              </div>
              <p className="text-lg font-medium text-slate-600 dark:text-slate-300 capitalize">{prediction.rainProbability > 60 ? 'Rain likely' : 'Cloudy'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <Stat icon={Droplets} label="Humidity" value={`${current.humidity}%`} />
            <Stat icon={Wind} label="Wind" value={`${current.windSpeed} km/h`} />
            <Stat icon={Gauge} label="Pressure" value={`${current.pressure} hPa`} />
            <Stat icon={Cloud} label="Cloud Cover" value={`${current.cloudCoverage}%`} />
          </div>
        </div>

        {/* Rain prediction */}
        <div className={`glass-card p-6 bg-gradient-to-br ${severityClasses(prediction.rainProbability)} relative overflow-hidden`}>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Rain Prediction</p>
          <div className="flex flex-col items-center relative">
            <CircularProgress value={prediction.rainProbability} label="rain probability" />
            <p className="mt-4 text-lg font-semibold text-slate-800 dark:text-white text-center">{prediction.prediction}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">Expected Rainfall</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{prediction.expectedRainfall} mm</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">Expected Time</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">{prediction.expectedTimeWindow}</p>
            </div>
          </div>
          {prediction.alertSeverity !== 'none' && (
            <div className={`mt-4 px-3 py-2 rounded-xl text-xs font-medium text-center ${
              prediction.alertSeverity === 'critical' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
              prediction.alertSeverity === 'high' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
              'bg-amber-500/20 text-amber-600 dark:text-amber-400'
            }`}>
              {prediction.alertSeverity === 'critical' ? 'Critical' : prediction.alertSeverity === 'high' ? 'High Priority' : 'Medium'} Alert: Rain expected soon
            </div>
          )}
        </div>
      </div>

      {/* Hourly forecast */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">Hourly Forecast</h2>
          <span className="text-xs text-slate-400">Next {hourly.length} hours</span>
        </div>

        {/* Rain probability chart */}
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rainChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line type="monotone" dataKey="prob" stroke="#06b6d4" strokeWidth={3} dot={{ r: 3, fill: '#06b6d4' }} name="Rain %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly cards */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {hourly.map((h, i) => (
            <div key={i} className="min-w-[72px] flex flex-col items-center gap-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs text-slate-500 dark:text-slate-400">{h.time}</span>
              <WeatherIcon condition={h.condition} className="w-6 h-6 text-blue-500" />
              <span className="text-sm font-semibold text-slate-800 dark:text-white">{Math.round(h.temperature)}°</span>
              <span className={`text-xs font-medium ${h.rainProbability > 60 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>{h.rainProbability}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-day forecast */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4">7-Day Forecast</h2>
        <div className="space-y-2">
          {daily.map((d, i) => {
            const { Icon } = weatherIcon(d.condition);
            return (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="w-24">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{d.day}</p>
                  <p className="text-xs text-slate-400">{d.date}</p>
                </div>
                <Icon className="w-7 h-7 text-blue-500 shrink-0" />
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">{Math.round(d.high)}°</span>
                  <span className="text-sm text-slate-400">{Math.round(d.low)}°</span>
                </div>
                <div className="flex items-center gap-2 w-28 justify-end">
                  <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.rainProbability}%`, background: d.rainProbability > 60 ? '#06b6d4' : '#94a3b8' }} />
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-8 text-right">{d.rainProbability}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rainfall bar chart */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Expected Rainfall (mm)</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourly.map((h) => ({ time: h.time, rainfall: h.rainfall }))} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="mm" />
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} cursor={{ fill: 'rgba(148,163,184,0.1)' }} />
              <Bar dataKey="rainfall" radius={[6, 6, 0, 0]}>
                {hourly.map((h, i) => (
                  <Cell key={i} fill={h.rainProbability > 80 ? '#ef4444' : h.rainProbability > 60 ? '#3b82f6' : '#06b6d4'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Droplets; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
      <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-blue-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{label}</p>
        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}
