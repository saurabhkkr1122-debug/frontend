import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, ScanSearch, ShieldAlert, BarChart3, Map as MapIcon,
  Bell, FileText, Sparkles, Settings as SettingsIcon, Gauge, LogOut, Menu, X,
  Search, CircleHelp, Landmark, ChevronRight,
} from 'lucide-react';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Project Monitoring', icon: FolderKanban },
  { to: '/anomaly-detection', label: 'AI Anomaly Detection', icon: ScanSearch },
  { to: '/fraud-risk', label: 'Fraud Risk', icon: ShieldAlert },
  { to: '/financial', label: 'Financial Analytics', icon: BarChart3 },
  { to: '/geographic-map', label: 'Geographic Map', icon: MapIcon },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/ai-insights', label: 'AI Insights', icon: Sparkles },
  { to: '/risk-predictor', label: 'Risk Predictor', icon: Gauge },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

const TITLES: Record<string, { title: string; sub: string }> = {
  '/dashboard': { title: 'Executive Overview Dashboard', sub: 'MPLADS fund performance at a glance' },
  '/projects': { title: 'Project Monitoring', sub: 'Track every sanctioned work across constituencies' },
  '/anomaly-detection': { title: 'AI Anomaly Detection', sub: 'Machine-learning surveillance of spend and schedule signals' },
  '/fraud-risk': { title: 'Fraud Risk Analytics', sub: 'Systemic risk scoring and suspicious-entity network' },
  '/financial': { title: 'Financial Analytics', sub: 'Allocation, utilisation and expenditure intelligence' },
  '/geographic-map': { title: 'Geographic Risk Map', sub: 'District-wise risk posture across India' },
  '/alerts': { title: 'Alerts & Investigation Center', sub: 'Triage, assign and resolve AI-generated alerts' },
  '/reports': { title: 'Reports', sub: 'Generate, schedule and export compliance dossiers' },
  '/ai-insights': { title: 'AI Insights Copilot', sub: 'Conversational monitoring assistant' },
  '/risk-predictor': { title: 'Manual Risk Predictor', sub: 'Simulate risk for a proposed work before sanction' },
  '/settings': { title: 'Settings', sub: 'Workspace preferences and detection thresholds' },
};

function pageMeta(path: string) {
  if (TITLES[path]) return TITLES[path];
  if (path.startsWith('/project-profile')) return { title: 'Project Performance Profile', sub: 'Deep-dive dossier for a single sanctioned work' };
  return { title: 'MPLAD Portal', sub: 'GovTech Enterprise monitoring suite' };
}

export default function AppShell() {
  const loc = useLocation();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [recent, setRecent] = useState<any[]>([]);
  const meta = pageMeta(loc.pathname);

  useEffect(() => {
    fetch('/api/alerts')
      .then((r) => r.json())
      .then((d) => setRecent(Array.isArray(d) ? d.filter((a) => a.status !== 'resolved').slice(0, 5) : []))
      .catch(() => {});
  }, []);

  const logout = () => {
    localStorage.removeItem('mplad_auth');
    nav('/login');
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    nav(`/projects?q=${encodeURIComponent(search)}`);
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900">
          <Landmark className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-bold tracking-tight">MPLAD Portal</p>
          <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">GovTech Enterprise</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map((n) => {
          const active = loc.pathname === n.to || (n.to === '/projects' && loc.pathname.startsWith('/project-profile'));
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-950' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">{n.label}</span>
              {n.label === 'Alerts' && recent.length > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold">{recent.length}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
          <img src="https://i.pravatar.cc/64?img=12" alt="avatar" className="h-8 w-8 rounded-full ring-2 ring-blue-500" />
          <div className="leading-tight">
            <p className="text-[13px] font-semibold">District Officer</p>
            <p className="text-[11px] text-slate-400">officer@gov.in</p>
          </div>
        </div>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-slate-300 transition hover:bg-red-500/15 hover:text-red-300">
          <LogOut className="h-[18px] w-[18px]" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-[Inter,system-ui,sans-serif] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 shadow-2xl">{sidebar}</aside>
          <button className="absolute right-4 top-4 rounded-full bg-white p-2" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button className="rounded-lg border border-slate-200 p-2 lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <span>MPLAD</span><ChevronRight className="h-3 w-3" /><span className="truncate">{meta.title}</span>
              </div>
              <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">{meta.title}</h1>
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <form onSubmit={submitSearch} className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects, IDs, vendors..." className="w-64 rounded-full border border-slate-200 bg-gray-50 py-2 pl-9 pr-4 text-[13px] outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" />
              </form>
              <div className="relative">
                <button onClick={() => setNotifOpen((v) => !v)} className="relative rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-gray-50 hover:text-slate-800">
                  <Bell className="h-[18px] w-[18px]" />
                  {recent.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">{recent.length}</span>}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
                    <p className="border-b border-slate-100 px-4 py-2.5 text-[13px] font-bold">Notifications</p>
                    {recent.map((a) => (
                      <Link key={a.id} to="/alerts" onClick={() => setNotifOpen(false)} className="block border-b border-slate-50 px-4 py-2.5 hover:bg-gray-50">
                        <p className="text-[13px] font-semibold leading-snug">{a.title}</p>
                        <p className="text-[12px] text-slate-500">{a.project_name} · {a.time_elapsed}</p>
                      </Link>
                    ))}
                    {recent.length === 0 && <p className="px-4 py-6 text-center text-[13px] text-slate-400">All clear. No open alerts.</p>}
                  </div>
                )}
              </div>
              <button title="Help" onClick={() => nav('/ai-insights')} className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-gray-50 hover:text-slate-800">
                <CircleHelp className="h-[18px] w-[18px]" />
              </button>
              <div className="hidden items-center gap-2.5 rounded-full border border-slate-200 py-1 pl-1 pr-3 sm:flex">
                <img src="https://i.pravatar.cc/64?img=12" alt="District Officer" className="h-8 w-8 rounded-full" />
                <div className="leading-tight">
                  <p className="text-[13px] font-semibold">District Officer</p>
                  <p className="text-[11px] text-slate-500">Admin Access</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
