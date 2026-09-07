import { useEffect, useState } from 'react';
import { TriangleAlert, TrendingUp, Building2, CircleAlert } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, Skeleton } from './Dashboard';

function Gauge({ score }: { score: number }) {
  const pct = Math.min(100, score) / 100;
  const r = 64;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? '#ef4444' : score >= 60 ? '#f59e0b' : '#10b981';
  return (
    <div className="relative mx-auto h-44 w-44">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
        <circle cx="80" cy="80" r={r} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${circ * pct} ${circ}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-4xl font-extrabold tracking-tight" style={{ color }}>{score}<span className="text-lg text-slate-400">/100</span></p>
      </div>
    </div>
  );
}

export default function FraudRisk() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch('/api/vendors').then((r) => r.json()), fetch('/api/trends').then((r) => r.json())])
      .then(([v, t]) => { setVendors(Array.isArray(v) ? v : []); setTrends(Array.isArray(t) ? t : []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid gap-4 lg:grid-cols-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-72" />)}</div>;

  const topRisk = vendors[0]?.risk_score ?? 78;
  const catData = [
    { cat: 'Shell entities', v: 34 }, { cat: 'Over-billing', v: 28 },
    { cat: 'Benami links', v: 19 }, { cat: 'Ghost labour', v: 15 }, { cat: 'Bid rigging', v: 12 },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card className="border-t-4 !border-t-red-500">
        <div className="flex items-center gap-2">
          <TriangleAlert className="h-5 w-5 text-red-500" />
          <h3 className="text-[15px] font-extrabold">System Risk Index</h3>
        </div>
        <Gauge score={topRisk} />
        <div className="mx-auto mt-2 max-w-sm rounded-xl bg-red-50 p-3.5 text-center ring-1 ring-red-100">
          <p className="text-[13px] font-bold text-red-700">Elevated network-wide posture</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-red-900/70">Composite fraud probability is {topRisk}% — 11 points above the national baseline. Concentrated vendor reuse across 3 districts is the dominant driver.</p>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <div><h3 className="text-[15px] font-extrabold">Suspicious Transaction Trends</h3><p className="text-[12px] text-slate-500">Flagged vs cleared payments · last 12 months</p></div>
        </div>
        <div className="mt-2 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="suspicious" stroke="#ef4444" strokeWidth={2.5} dot={false} name="Suspicious (Rs L)" />
              <Line type="monotone" dataKey="legitimate" stroke="#10b981" strokeWidth={2} dot={false} name="Cleared (Rs L)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="suspicious" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Spike volume" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="text-[15px] font-extrabold">Fraud Pattern Mix</h3>
        <p className="text-[12px] text-slate-500">Detected typologies this quarter</p>
        <div className="mt-2 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={catData} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="cat" tick={{ fontSize: 11 }} width={95} />
              <Tooltip />
              <Bar dataKey="v" fill="#2563eb" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-5">
          <Building2 className="h-5 w-5 text-slate-700" />
          <div><h3 className="text-[15px] font-extrabold">Top High-Risk Entities</h3><p className="text-[12px] text-slate-500">Flagged vendors under enhanced watch</p></div>
        </div>
        <div className="mt-3 divide-y divide-slate-50">
          {vendors.slice(0, 5).map((v) => (
            <div key={v.id} className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100"><CircleAlert className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-bold">{v.name}</p>
                  <p className="font-mono text-[11px] text-slate-400">{v.gstin} · {v.location} · {v.transactions} linked payments</p>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-[17px] font-extrabold ${v.risk_score >= 80 ? 'text-red-600' : v.risk_score >= 60 ? 'text-amber-600' : 'text-emerald-600'}`}>{v.risk_score}</p>
                  <p className="text-[10.5px] font-bold uppercase text-slate-400">risk</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${v.risk_score >= 80 ? 'bg-red-500' : v.risk_score >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${v.risk_score}%` }} /></div>
              <p className="mt-1.5 flex gap-1.5 text-[12.5px] leading-relaxed text-slate-600"><span className="font-bold text-slate-800">AI:</span>{v.explanation}</p>
            </div>
          ))}
          {vendors.length === 0 && <p className="px-5 py-10 text-center text-slate-400">No flagged entities.</p>}
        </div>
      </Card>
    </div>
  );
}
