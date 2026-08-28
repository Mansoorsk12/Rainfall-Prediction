import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { SavedLocation } from '@/lib/types';
import { fetchLocations, addLocation, deleteLocation, setPrimaryLocation } from '@/lib/dataService';
import { DEMO_LOCATIONS, nearestDemoCity } from '@/lib/mockWeather';
import { useAuth } from './AuthContext';

interface LocationContextValue {
  locations: SavedLocation[];
  active: SavedLocation | null;
  setActive: (l: SavedLocation) => void;
  loading: boolean;
  demoMode: boolean;
  setDemoMode: (v: boolean) => void;
  detectLocation: () => Promise<void>;
  addCity: (name: string) => Promise<void>;
  removeLocation: (id: string) => Promise<void>;
  makePrimary: (id: string) => Promise<void>;
  geoError: string | null;
  geoLoading: boolean;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [active, setActiveState] = useState<SavedLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const locs = await fetchLocations();
      setLocations(locs);
      const primary = locs.find((l) => l.is_primary) ?? locs[0] ?? null;
      setActiveState(primary);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) load();
    else { setLocations([]); setActiveState(null); setLoading(false); }
  }, [user, load]);

  const detectLocation = useCallback(async () => {
    setGeoError(null);
    setGeoLoading(true);
    if (!('geolocation' in navigator)) {
      setGeoError('Geolocation is not supported by your browser.');
      setGeoLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const city = nearestDemoCity(latitude, longitude);
          const added = await addLocation({
            name: city.name,
            region: city.region,
            lat: latitude,
            lon: longitude,
            is_primary: locations.length === 0,
          });
          setLocations((prev) => [...prev, added]);
          setActiveState(added);
        } catch {
          setGeoError('Could not save your location.');
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        const msg = err.code === err.PERMISSION_DENIED
          ? 'Location permission denied. You can search for a city instead.'
          : 'Unable to detect your location. Try searching for a city.';
        setGeoError(msg);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [locations.length]);

  const addCity = useCallback(async (name: string) => {
    const match = DEMO_LOCATIONS.find((l) => l.name.toLowerCase() === name.toLowerCase());
    const base = match ?? { name, region: 'India' };
    const added = await addLocation({
      name: base.name,
      region: base.region,
      lat: base.lat,
      lon: base.lon,
      is_primary: locations.length === 0,
    });
    setLocations((prev) => [...prev, added]);
    setActiveState(added);
  }, [locations.length]);

  const removeLocation = useCallback(async (id: string) => {
    await deleteLocation(id);
    setLocations((prev) => {
      const next = prev.filter((l) => l.id !== id);
      if (active?.id === id) setActiveState(next[0] ?? null);
      return next;
    });
  }, [active?.id]);

  const makePrimary = useCallback(async (id: string) => {
    await setPrimaryLocation(id);
    setLocations((prev) => prev.map((l) => ({ ...l, is_primary: l.id === id })));
    const p = locations.find((l) => l.id === id);
    if (p) setActiveState({ ...p, is_primary: true });
  }, [locations]);

  return (
    <LocationContext.Provider value={{
      locations, active, setActive: setActiveState, loading,
      demoMode, setDemoMode,
      detectLocation, addCity, removeLocation, makePrimary,
      geoError, geoLoading,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLocations(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocations must be used within LocationProvider');
  return ctx;
}
