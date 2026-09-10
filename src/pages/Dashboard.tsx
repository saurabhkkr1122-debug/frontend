import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, IndianRupee, Clock3, ShieldAlert, TrendingUp, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#2563eb'];

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Low Risk': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    'On Track': 'bg-blue-50 text-blue-700 ring-blue-200',
    Elevated: 'bg-amber-50 text-amber-700 ring-amber-200',
    Critical: 'bg-red-50 text-red-700 ring-red-200',
    Delayed: 'bg-orange-50 text-orange-700 ring-orange-200',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-bold ring-1 ${map[status] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>{status}</span>;
}

export function ProgressBar({ value, tone }: { value: number; tone?: string }) {
  const color = tone || (value >= 70 ? 'bg-emerald-500' : value >= 40 ? 'bg-blue-500' : 'bg-amber-500');
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      <span className="w-9 text-right text-[12px] font-bold text-slate-600">{value}%</span>
    </div>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetch('/api/projects').then((r) => r.json()), fetch('/api/dashboard/stats').then((r) => r.json())])
      .then(([p, s]) => { setProjects(Array.isArray(p) ? p : []); setStats(s); })
      .catch(() => setError('Could not load dashboard data. Please retry.'))
      .finally(() => setLoading(false));
  }, []);

  const pie = useMemo(() => {
    if (!stats?.byStatus) return [];
    return Object.entries(stats.byStatus).map(([name, value]) => ({ name, value }));
  }, [stats]);

  const kpis = [
    { label: 'Total Projects', value: stats?.totalProjects ?? '—', icon: FolderKanban, bg: 'bg-blue-50 text-blue-600', trend: '+12 this quarter', up: true },
    { label: 'Total Allocated (Cr)', value: stats ? `Rs ${(Number(stats.totalAllocated) / 100).toFixed(2)}` : '—', icon: IndianRupee, bg: 'bg-emerald-50 text-emerald-600', trend: '+8.4% YoY utilisation', up: true },
    { label: 'Delayed Projects', value: stats?.delayedProjects ?? '—', icon: Clock3, bg: 'bg-amber-50 text-amber-600', trend: '-3 since last review', up: false },
    { label: 'Fraud Alerts', value: stats?.fraudAlerts ?? '—', icon: ShieldAlert, bg: 'bg-red-50 text-red-600', trend: 'Needs triage today', up: false },
  ];

  if (loading) return <div className="space-y-4"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}</div><Skeleton className="h-96" /></div>;
  if (error) return <div className="rounded-xl bg-red-50 p-6 text-center text-[14px] font-medium text-red-600">{error}</div>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12.5px] font-semibold uppercase tracking-wide text-slate-500">{k.label}</p>
                  <p className="mt-1.5 text-[26px] font-extrabold tracking-tight">{k.value}</p>
                  <p className={`mt-1 flex items-center gap-1 text-[12px] font-semibold ${k.up ? 'text-emerald-600' : 'text-slate-500'}`}><TrendingUp className="h-3.5 w-3.5" />{k.trend}</p>
                </div>
                <div className={`rounded-xl p-3 ${k.bg}`}><Icon className="h-6 w-6" /></div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <div><h3 className="text-[15px] font-bold">Allocation by Sector (Rs Lakh)</h3><p className="text-[12px] text-slate-500">Sanctioned value across live portfolio</p></div>
            <Link to="/financial" className="flex items-center gap-1 text-[12.5px] font-bold text-blue-600 hover:underline">Details <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.bySector || []} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="sector" tick={{ fontSize: 10 }} interval={0} angle={-14} dy={8} height={52} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="text-[15px] font-bold">Portfolio Risk Mix</h3>
          <p className="text-[12px] text-slate-500">Share of works by current band</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={3}>
                  {pie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2">
            {pie.map((p: any, i: number) => (
              <span key={p.name} className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />{p.name} ({String(p.value)})
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div><h3 className="text-[15px] font-bold">Active MPLAD Projects</h3><p className="text-[12px] text-slate-500">{projects.length} works under live monitoring</p></div>
          <Link to="/projects" className="flex items-center gap-1 rounded-lg bg-blue-600 px-3.5 py-2 text-[12.5px] font-bold text-white hover:bg-blue-700">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead><tr className="border-b border-slate-100 bg-gray-50/70 text-[11.5px] uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-bold">Project ID</th><th className="px-5 py-3 font-bold">Name & Constituency</th><th className="px-5 py-3 font-bold">Amount</th><th className="px-5 py-3 font-bold">Progress</th><th className="px-5 py-3 font-bold">Status</th>
            </tr></thead>
            <tbody>
              {projects.slice(0, 8).map((p) => (
                <tr key={p.id} className="border-b border-slate-50 transition last:border-0 hover:bg-blue-50/40">
                  <td className="px-5 py-3.5 font-mono text-[12px] font-bold text-blue-700"><Link to={`/project-profile/${p.id}`}>{p.project_id}</Link></td>
                  <td className="px-5 py-3.5"><p className="font-semibold leading-snug">{p.name}</p><p className="text-[12px] text-slate-500">{p.constituency} · {p.state}</p></td>
                  <td className="px-5 py-3.5 font-bold">Rs {p.amount}L</td>
                  <td className="px-5 py-3.5"><div className="w-40"><ProgressBar value={p.progress} /></div></td>
                  <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
