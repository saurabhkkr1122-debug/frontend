import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { IndianRupee, Percent, ArrowUpRight } from 'lucide-react';
import { Card, Skeleton } from './Dashboard';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function FinancialAnalytics() {
  const [trends, setTrends] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch('/api/trends').then((r) => r.json()), fetch('/api/dashboard-stats').then((r) => r.json())])
      .then(([t, s]) => { setTrends(Array.isArray(t) ? t : []); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}</div>;

  const pie = (stats?.bySector || []).map((s: any) => ({ name: s.sector, value: Number(s.amount) || 0 }));
  const total = pie.reduce((s: number, p: any) => s + p.value, 0);
  const utilisation = trends.length ? Math.round(trends.reduce((s, t) => s + (Number(t.utilisation) || 0), 0) / trends.length) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { l: 'Funds Released (FY 2026-27)', v: `Rs ${(total / 100).toFixed(2)} Cr`, i: IndianRupee, c: 'bg-blue-50 text-blue-600' },
          { l: 'Average Utilisation', v: `${utilisation}%`, i: Percent, c: 'bg-emerald-50 text-emerald-600' },
          { l: 'Sectors Funded', v: String(pie.length), i: ArrowUpRight, c: 'bg-violet-50 text-violet-600' },
        ].map((k) => {
          const Icon = k.i;
          return (
            <Card key={k.l}><div className="flex items-center gap-3"><div className={`rounded-xl p-2.5 ${k.c}`}><Icon className="h-5 w-5" /></div>
            <div><p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">{k.l}</p><p className="text-xl font-extrabold">{k.v}</p></div></div></Card>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h3 className="text-[15px] font-extrabold">Expenditure vs Allocation (Rs Lakh)</h3>
          <p className="text-[12px] text-slate-500">Monthly burn against sanctioned pipeline</p>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="allocation" stroke="#2563eb" fill="#2563eb22" strokeWidth={2.5} name="Allocation" />
                <Area type="monotone" dataKey="expenditure" stroke="#10b981" fill="#10b98122" strokeWidth={2.5} name="Expenditure" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="text-[15px] font-extrabold">Sector Split</h3>
          <p className="text-[12px] text-slate-500">Live sanctioned value</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={pie} dataKey="value" nameKey="name" innerRadius={48} outerRadius={74} paddingAngle={3}>
                {pie.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5">
            {pie.map((p: any, i: number) => (
              <div key={p.name} className="flex items-center gap-2 text-[12px] font-semibold text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="truncate">{p.name}</span><span className="ml-auto font-mono">Rs {p.value}L</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <h3 className="text-[15px] font-extrabold">Utilisation Trajectory (%)</h3>
        <div className="mt-2 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="utilisation" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="Utilisation %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
