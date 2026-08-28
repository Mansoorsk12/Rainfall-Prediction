import { useEffect, useState } from 'react';
import { Bell, Loader2, Trash2, CheckCheck, Filter, AlertTriangle } from 'lucide-react';
import type { AlertRow } from '@/lib/types';
import { fetchAlerts, markAlertRead, deleteAlert } from '@/lib/dataService';

type SeverityFilter = 'all' | 'low' | 'medium' | 'high' | 'critical';

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SeverityFilter>('all');

  const load = async () => {
    setLoading(true);
    try {
      setAlerts(await fetchAlerts());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter);
  const unreadCount = alerts.filter((a) => a.status === 'unread').length;

  const onMarkRead = async (id: string) => {
    await markAlertRead(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'read' } : a)));
  };

  const onDelete = async (id: string) => {
    await deleteAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const severityStyle = (s: string) => {
    switch (s) {
      case 'critical': return { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20', icon: '🌧️' };
      case 'high': return { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20', icon: '🌧️' };
      case 'medium': return { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', icon: '🌦️' };
      default: return { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', icon: '💧' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Alerts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{unreadCount} unread of {alerts.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as SeverityFilter)}
            className="input-field py-2 text-sm w-auto"
          >
            <option value="all">All severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No alerts</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">You're all clear. Alerts will appear here when rain is likely.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const s = severityStyle(a.severity);
            return (
              <div key={a.id} className={`glass-card p-4 border ${s.border} ${a.status === 'unread' ? 'ring-1 ring-blue-500/20' : 'opacity-70'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-lg shrink-0`}>{s.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold uppercase ${s.text}`}>{a.severity}</span>
                      {a.status === 'unread' && <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">New</span>}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{a.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>📍 {a.location_name}</span>
                      <span>Probability: {Math.round(a.rain_probability)}%</span>
                      <span>Rainfall: {a.rainfall}mm</span>
                      <span>{new Date(a.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {a.status === 'unread' && (
                      <button onClick={() => onMarkRead(a.id)} title="Mark read" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors">
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => onDelete(a.id)} title="Delete" className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alert logic explainer */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">Smart Alert Logic</h2>
        </div>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p><span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">probability ≥ 70</span> → medium alert</p>
          <p><span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">probability ≥ 80 &amp; rainfall ≥ 10mm</span> → high alert</p>
          <p><span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">probability ≥ 90 &amp; rainfall ≥ 20mm</span> → critical alert</p>
          <p className="text-xs text-slate-400 mt-2">Duplicate alerts for the same weather event are prevented by a cooldown period configurable in Settings.</p>
        </div>
      </div>
    </div>
  );
}
