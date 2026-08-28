import { useState } from 'react';
import { MapPin, Loader2, Search, Sparkles, CloudRain } from 'lucide-react';
import { useLocations } from '@/context/LocationContext';
import { DEMO_LOCATIONS } from '@/lib/mockWeather';

interface LocationPickerProps {
  onPicked: () => void;
}

export default function LocationPicker({ onPicked }: LocationPickerProps) {
  const { detectLocation, addCity, geoLoading, geoError } = useLocations();
  const [search, setSearch] = useState('');

  const pick = async (name: string) => {
    try {
      await addCity(name);
      onPicked();
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-card p-8 animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 mb-3">
            <MapPin className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Choose your location</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Detect your location automatically or pick a city to start.</p>
        </div>

        <button
          onClick={detectLocation}
          disabled={geoLoading}
          className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
        >
          {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          Detect my current location
        </button>

        {geoError && <p className="text-xs text-amber-600 dark:text-amber-400 mb-4 text-center">{geoError}</p>}

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
          <div className="relative flex justify-center"><span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400">or search a city</span></div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input-field pl-10"
            placeholder="Type a city name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && search.trim()) pick(search.trim()); }}
          />
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Popular cities
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_LOCATIONS.map((c) => (
              <button
                key={c.name}
                onClick={() => pick(c.name)}
                className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left transition-colors group"
              >
                <CloudRain className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{c.name}</p>
                  <p className="text-xs text-slate-400 truncate">{c.region}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
