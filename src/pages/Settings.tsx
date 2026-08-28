import { useEffect, useState } from 'react';
import { Loader2, Bell, MapPin, Trash2, Star, Plus, Settings as SettingsIcon, Check } from 'lucide-react';
import type { NotificationSettings, SavedLocation } from '@/lib/types';
import { getNotificationSettings, upsertNotificationSettings } from '@/lib/dataService';
import { useLocations } from '@/context/LocationContext';

export default function Settings() {
  const { locations, removeLocation, makePrimary, addCity } = useLocations();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newCity, setNewCity] = useState('');
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    getNotificationSettings()
      .then((s) => {
        setSettings(s ?? { enabled: true, min_probability: 70, min_rainfall: 5, lead_time_minutes: 60 });
      })
      .finally(() => setLoading(false));

    if ('Notification' in window) setNotifPermission(Notification.permission);
  }, []);

  const onSave = async () => {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await upsertNotificationSettings(settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const requestNotifPermission = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      new Notification('RainGuard', { body: 'Rain alerts are now enabled. We will notify you before significant rainfall occurs.' });
    }
  };

  const onAddCity = async () => {
    if (!newCity.trim()) return;
    try {
      await addCity(newCity.trim());
      setNewCity('');
    } catch {
      // ignore
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage locations and alert preferences</p>
      </div>

      {/* Notification permission */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-blue-500" />
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">Browser Notifications</h2>
        </div>
        {notifPermission === 'granted' ? (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <Check className="w-4 h-4" /> Notifications are enabled. You'll be alerted before significant rainfall.
          </div>
        ) : notifPermission === 'denied' ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">Notification permission was denied. Update your browser settings to allow RainGuard notifications.</p>
        ) : (
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Get notified before significant rainfall occurs in your area.</p>
            <button onClick={requestNotifPermission} className="btn-primary inline-flex items-center gap-2">
              <Bell className="w-4 h-4" /> Enable Alerts
            </button>
          </div>
        )}
      </div>

      {/* Alert conditions */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon className="w-5 h-5 text-blue-500" />
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">Alert Conditions</h2>
        </div>
        {settings && (
          <div className="space-y-5">
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-700 dark:text-slate-200">Enable alerts</span>
              <button
                onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.enabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </label>

            <SliderField
              label="Minimum rain probability"
              value={settings.min_probability}
              min={0} max={100} step={5} unit="%"
              onChange={(v) => setSettings({ ...settings, min_probability: v })}
            />
            <SliderField
              label="Minimum rainfall amount"
              value={settings.min_rainfall}
              min={0} max={50} step={1} unit="mm"
              onChange={(v) => setSettings({ ...settings, min_rainfall: v })}
            />
            <SliderField
              label="Alert lead time"
              value={settings.lead_time_minutes}
              min={15} max={180} step={15} unit="min"
              onChange={(v) => setSettings({ ...settings, lead_time_minutes: v })}
            />

            <div className="flex items-center gap-3 pt-2">
              <button onClick={onSave} disabled={saving} className="btn-primary inline-flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Settings
              </button>
              {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved!</span>}
            </div>
          </div>
        )}
      </div>

      {/* Saved locations */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-blue-500" />
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">Saved Locations</h2>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            className="input-field flex-1"
            placeholder="Add a city…"
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddCity()}
          />
          <button onClick={onAddCity} className="btn-primary inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {locations.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No saved locations yet. Add a city or use the detect button in the header.</p>
        ) : (
          <div className="space-y-2">
            {locations.map((l: SavedLocation) => (
              <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{l.name}</p>
                  <p className="text-xs text-slate-400 truncate">{l.region}</p>
                </div>
                {l.is_primary ? (
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-current" /> Primary</span>
                ) : (
                  <button onClick={() => l.id && makePrimary(l.id)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-500 transition-colors" title="Set as primary">
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => l.id && removeLocation(l.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors" title="Remove">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SliderField({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );
}
