import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Trash2 } from 'lucide-react';
import { Card, StatusBadge, ProgressBar, Skeleton } from './Dashboard';

const STATUS = ['All', 'Low Risk', 'On Track', 'Elevated', 'Critical', 'Delayed'];

export default function ProjectMonitoring() {
  const [params] = useSearchParams();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState(params.get('q') || '');
  const [status, setStatus] = useState('All');
  const [stateF, setStateF] = useState('All');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/projects');
      const d = await r.json();
      setProjects(Array.isArray(d) ? d : []);
    } catch { setError('Failed to load projects.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { setQ(params.get('q') || ''); }, [params]);

  const states = useMemo(() => ['All', ...Array.from(new Set(projects.map((p) => p.state).filter(Boolean)))], [projects]);
  const filtered = projects.filter((p) => {
    if (status !== 'All' && p.status !== status) return false;
    if (stateF !== 'All' && p.state !== stateF) return false;
    if (q && ![p.project_id, p.name, p.constituency, p.vendor_name].filter(Boolean).join(' ').toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const remove = async (id: number) => {
    if (!confirm('Delete this project record?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ID, name, constituency, vendor..." className="w-full rounded-xl border border-slate-200 bg-gray-50 py-2.5 pl-9 pr-4 text-[13.5px] outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-semibold outline-none focus:border-blue-500">
              {STATUS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={stateF} onChange={(e) => setStateF(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-semibold outline-none focus:border-blue-500">
              {states.map((s) => <option key={s}>{s}</option>)}
            </select>
            <Link to="/risk-predictor" className="rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-blue-700">+ Simulate New Work</Link>
          </div>
        </div>
      </Card>
      {loading ? <Skeleton className="h-96" /> : error ? <div className="rounded-xl bg-red-50 p-6 text-center text-red-600">{error}</div> : (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-[13px]">
              <thead><tr className="border-b border-slate-100 bg-gray-50/70 text-[11.5px] uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-bold">Project ID</th><th className="px-5 py-3 font-bold">Name & Constituency</th><th className="px-5 py-3 font-bold">Sector</th><th className="px-5 py-3 font-bold">Amount</th><th className="px-5 py-3 font-bold">Progress</th><th className="px-5 py-3 font-bold">Risk</th><th className="px-5 py-3 font-bold">Status</th><th className="px-5 py-3" />
              </tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-blue-50/40">
                    <td className="px-5 py-3.5 font-mono text-[12px] font-bold text-blue-700"><Link to={`/project-profile/${p.id}`}>{p.project_id}</Link></td>
                    <td className="px-5 py-3.5"><Link to={`/project-profile/${p.id}`} className="font-semibold hover:text-blue-700">{p.name}</Link><p className="flex items-center gap-1 text-[12px] text-slate-500"><MapPin className="h-3 w-3" />{p.constituency} · {p.state}</p></td>
                    <td className="px-5 py-3.5 text-slate-600">{p.sector}</td>
                    <td className="px-5 py-3.5 font-bold">Rs {p.amount}L</td>
                    <td className="px-5 py-3.5"><div className="w-36"><ProgressBar value={p.progress} /></div></td>
                    <td className="px-5 py-3.5"><span className={`font-mono text-[12.5px] font-extrabold ${p.risk_score >= 80 ? 'text-red-600' : p.risk_score >= 60 ? 'text-amber-600' : 'text-emerald-600'}`}>{p.risk_score}/100</span></td>
                    <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-3.5"><button onClick={() => remove(p.id)} className="rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="px-5 py-10 text-center text-[13.5px] text-slate-400">No projects match these filters.</p>}
        </Card>
      )}
    </div>
  );
}
