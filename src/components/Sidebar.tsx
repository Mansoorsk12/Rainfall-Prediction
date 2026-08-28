import { LayoutDashboard, CalendarRange, BrainCircuit, Bell, History, Settings, CloudRain, X } from 'lucide-react';
import type { Page } from '@/lib/types';

const NAV: { id: Page; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'forecast', label: 'Forecast', Icon: CalendarRange },
  { id: 'prediction', label: 'Prediction', Icon: BrainCircuit },
  { id: 'alerts', label: 'Alerts', Icon: Bell },
  { id: 'history', label: 'History', Icon: History },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

interface SidebarProps {
  page: Page;
  setPage: (p: Page) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ page, setPage, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onCloseMobile} />
      )}

      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 glass border-r border-white/30 dark:border-slate-700/50 p-4 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <CloudRain className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white leading-tight">RainGuard</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">AI Rainfall System</p>
            </div>
          </div>
          <button onClick={onCloseMobile} className="lg:hidden text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-1.5">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setPage(id); onCloseMobile(); }}
              className={`nav-item w-full ${page === id ? 'nav-item-active' : 'nav-item-inactive'}`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass-card p-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">Model</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Rule-based v1</p>
            <p className="text-[10px] text-slate-400 mt-1">ML-ready architecture</p>
          </div>
        </div>
      </aside>
    </>
  );
}
