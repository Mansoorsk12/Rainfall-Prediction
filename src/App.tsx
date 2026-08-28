import { useEffect, useState } from 'react';
import { CloudRain, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LocationProvider, useLocations } from '@/context/LocationContext';
import { useWeather } from '@/hooks/useWeather';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import LocationPicker from '@/components/LocationPicker';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import Forecast from '@/pages/Forecast';
import Prediction from '@/pages/Prediction';
import Alerts from '@/pages/Alerts';
import History from '@/pages/History';
import Settings from '@/pages/Settings';
import type { Page } from '@/lib/types';

function AppShell() {
  const { user, loading: authLoading } = useAuth();
  const { active, loading: locLoading, demoMode, setDemoMode } = useLocations();
  const [page, setPage] = useState<Page>('dashboard');
  const [mobileNav, setMobileNav] = useState(false);
  const [pickerDismissed, setPickerDismissed] = useState(false);

  const { data, loading: weatherLoading, error, refresh } = useWeather(active, demoMode);

  // Browser notification when a high-severity prediction comes in.
  useEffect(() => {
    if (!data || !active) return;
    if (data.prediction.alertSeverity === 'none') return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const key = `${active.name}-${new Date().getHours()}`;
    if (sessionStorage.getItem('last-notif') === key) return;
    sessionStorage.setItem('last-notif', key);
    new Notification('🌧️ Rain Alert', {
      body: `${data.prediction.prediction} in ${active.name}. Probability: ${Math.round(data.prediction.rainProbability)}%, Expected: ${data.prediction.expectedRainfall}mm`,
    });
  }, [data, active]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const showPicker = !active && !locLoading && !pickerDismissed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      <div className="flex">
        <Sidebar page={page} setPage={setPage} mobileOpen={mobileNav} onCloseMobile={() => setMobileNav(false)} />

        <div className="flex-1 min-w-0">
          <Header onOpenMobileNav={() => setMobileNav(true)} />

          <main className="p-4 lg:p-6 max-w-6xl mx-auto">
            {/* Demo mode banner */}
            <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                  {demoMode ? 'Demo Mode' : 'Live Mode'}
                </span>
                <span className="text-slate-400">Model: rule-based-v1</span>
              </div>
              <button
                onClick={() => setDemoMode(!demoMode)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {demoMode ? 'Disable Demo Mode' : 'Enable Demo Mode'}
              </button>
            </div>

            {showPicker ? (
              <LocationPicker onPicked={() => setPickerDismissed(true)} />
            ) : (
              <>
                {page === 'dashboard' && <Dashboard data={data} loading={weatherLoading} error={error} locationName={active?.name ?? ''} onRefresh={refresh} />}
                {page === 'forecast' && <Forecast data={data} loading={weatherLoading} />}
                {page === 'prediction' && <Prediction data={data} loading={weatherLoading} />}
                {page === 'alerts' && <Alerts />}
                {page === 'history' && <History />}
                {page === 'settings' && <Settings />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationProvider>
          <AppShell />
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
