import { useState, type FormEvent } from 'react';
import { Menu, Search, Bell, Sun, Moon, MapPin, Loader2, Plus, LogOut, User } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLocations } from '@/context/LocationContext';
import { DEMO_LOCATIONS } from '@/lib/mockWeather';

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export default function Header({ onOpenMobileNav }: HeaderProps) {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const { active, addCity, detectLocation, geoLoading, geoError, locations } = useLocations();
  const [search, setSearch] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [adding, setAdding] = useState(false);

  const suggestions = DEMO_LOCATIONS.filter(
    (l) => l.name.toLowerCase().includes(search.toLowerCase()) && search.length > 0
  );

  const onSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setAdding(true);
    try {
      await addCity(search.trim());
      setSearch('');
    } catch {
      // ignore
    } finally {
      setAdding(false);
    }
  };

  const userName = (user?.user_metadata?.name as string) || user?.email?.split('@')[0] || 'User';

  return (
    <header className="sticky top-0 z-20 glass border-b border-white/30 dark:border-slate-700/50 px-4 lg:px-6 py-3">
      <div className="flex items-center gap-3">
        <button onClick={onOpenMobileNav} className="lg:hidden text-slate-600 dark:text-slate-300">
          <Menu className="w-6 h-6" />
        </button>

        {/* Location display */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-blue-500" />
          <div className="leading-tight">
            <p className="font-semibold text-slate-800 dark:text-white">{active?.name ?? 'No location'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{active?.region ?? 'Select or detect a location'}</p>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={onSearch} className="relative flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input-field pl-10 pr-10 py-2 text-sm"
              placeholder="Search a city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {adding && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />}
          </div>
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 glass-card p-1 z-30">
              {suggestions.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => { setSearch(s.name); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-slate-400">{s.region}</span>
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Detect location */}
        <button
          onClick={detectLocation}
          disabled={geoLoading}
          title="Detect my location"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
        >
          {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
          <span className="hidden lg:inline">Detect</span>
        </button>

        <button onClick={toggle} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
          <Bell className="w-5 h-5" />
          {locations.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile((s) => !s)}
            className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-200">{userName}</span>
          </button>
          {showProfile && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 glass-card p-2 z-40">
                <div className="px-3 py-2 border-b border-slate-200/60 dark:border-slate-700/50 mb-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2"><User className="w-4 h-4" /> {userName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>
                <button onClick={() => setShowProfile(false)} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Plus className="w-4 h-4" /> Add location
                </button>
                <button onClick={signOut} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {geoError && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> {geoError}
        </p>
      )}
    </header>
  );
}
