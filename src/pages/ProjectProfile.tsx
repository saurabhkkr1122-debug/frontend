import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, IndianRupee, Wallet, BadgeCheck, FileCheck, Flag, Hammer, CalendarCheck2, BrainCircuit } from 'lucide-react';
import { Card, StatusBadge, Skeleton } from './Dashboard';

const STEPS = [
  { k: 'Proposal', icon: Flag }, { k: 'Sanctioned', icon: FileCheck }, { k: 'Started', icon: Hammer }, { k: 'Expected Completion', icon: CalendarCheck2 },
];

export default function ProjectProfile() {
  const { id } = useParams();
  const [p, setP] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetch(`/api/projects?id=${id}`).then((r) => r.json()), fetch('/api/alerts').then((r) => r.json())])
      .then(([proj, alerts]) => {
        const row = Array.isArray(proj) ? proj[0] : proj;
        if (!row?.id) { setError('Project not found.'); return; }
        setP(row);
        setRelated((Array.isArray(alerts) ? alerts : []).filter((a) => String(a.project_id) === String(row.id) || (row.project_id && a.project_id === row.project_id)).slice(0, 4));
      })
      .catch(() => setError('Failed to load project dossier.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-28" /><div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div></div>;
  if (error || !p) return <div className="rounded-xl bg-red-50 p-8 text-center text-red-600">{error || 'Not found'} <Link to="/projects" className="ml-2 font-bold underline">Back</Link></div>;

  const dates = ['Proposal stage', p.sanctioned_date, p.started_date, p.expected_completion];
  const riskColor = p.risk_score >= 80 ? 'text-red-600' : p.risk_score >= 60 ? 'text-amber-600' : 'text-emerald-600';

  return (
    <div className="space-y-4">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-500 hover:text-blue-700"><ArrowLeft className="h-4 w-4" />Back to monitoring</Link>
      <Card className="border-l-4 !border-l-blue-600">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[12px] font-bold text-blue-600">{p.project_id}</p>
            <h2 className="mt-0.5 text-[22px] font-extrabold tracking-tight">{p.name}</h2>
            <p className="mt-1 text-[13px] font-medium text-slate-500">{p.constituency} · {p.state} · {p.sector} · Nodal: {p.nodal_district}</p>
          </div>
          <StatusBadge status={p.status} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <h3 className="text-[14.5px] font-extrabold">Project Overview</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{p.description}</p>
          <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-[13px]">
            {[['Implementing agency', p.implementing_agency], ['Vendor', `${p.vendor_name || '—'}`], ['Vendor GSTIN', p.vendor_gstin || 'Not on record'], ['Constituency', p.constituency]].map(([k, v]) => (
              <div key={k as string} className="flex justify-between gap-3"><span className="text-slate-500">{k}</span><span className="text-right font-bold">{v}</span></div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-[14.5px] font-extrabold">Financial Summary</h3>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-gray-50 p-3"><div className="mb-1.5 inline-flex rounded-lg bg-blue-50 p-1.5 text-blue-600"><IndianRupee className="h-4 w-4" /></div><p className="text-[11px] font-bold uppercase text-slate-400">Sanctioned</p><p className="text-[17px] font-extrabold">Rs {p.amount}L</p></div>
            <div className="rounded-xl bg-gray-50 p-3"><div className="mb-1.5 inline-flex rounded-lg bg-emerald-50 p-1.5 text-emerald-600"><Wallet className="h-4 w-4" /></div><p className="text-[11px] font-bold uppercase text-slate-400">Utilised</p><p className="text-[17px] font-extrabold">{p.utilisation}%</p></div>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[12px] font-bold text-slate-500"><span>PHYSICAL PROGRESS</span><span>{p.progress}%</span></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${p.progress}%` }} /></div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-[12.5px] font-bold text-emerald-700 ring-1 ring-emerald-100"><BadgeCheck className="h-4 w-4" />UC-II filed · PFMS verified</div>
        </Card>
        <Card className="border-t-4 !border-t-violet-500">
          <h3 className="flex items-center gap-2 text-[14.5px] font-extrabold"><BrainCircuit className="h-5 w-5 text-violet-600" />AI Analysis</h3>
          <div className="mt-3 flex items-center gap-4">
            <div className="text-center"><p className={`text-3xl font-extrabold ${riskColor}`}>{p.risk_score}<span className="text-sm text-slate-400">/100</span></p><p className="text-[11px] font-bold uppercase text-slate-400">Risk score</p></div>
            <div className="h-12 w-px bg-slate-100" />
            <div className="text-center"><p className="text-3xl font-extrabold text-slate-700">{p.anomaly_score}<span className="text-sm text-slate-400">/100</span></p><p className="text-[11px] font-bold uppercase text-slate-400">Anomaly</p></div>
          </div>
          <div className="mt-3 rounded-xl bg-violet-50 p-3.5 text-[12.5px] leading-relaxed text-slate-700 ring-1 ring-violet-100">
            {p.risk_score >= 80
              ? `High composite risk: spend velocity is ${(p.anomaly_score || 0) > 70 ? 'abnormally front-loaded' : 'irregular'} and vendor linkage graphs show repeat awards. Recommend freezing the next tranche pending field verification.`
              : p.risk_score >= 60
              ? `Elevated watch: utilisation trails the district median and progress reports show gaps. Increase inspection frequency before the next release.`
              : `Stable profile: expenditure cadence and milestone evidence align with comparable ${p.sector} works. Continue routine monthly surveillance.`}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-[14.5px] font-extrabold">Project Timeline</h3>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < 3;
            return (
              <div key={s.k} className="relative">
                {i < 3 && <span className={`absolute left-1/2 top-5 hidden h-0.5 w-full ${done ? 'bg-emerald-400' : 'bg-slate-200'} md:block`} />}
                <div className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-white ${done ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}><Icon className="h-5 w-5" /></div>
                <p className="mt-2 text-center text-[12.5px] font-extrabold">{s.k}</p>
                <p className="text-center font-mono text-[11.5px] text-slate-500">{dates[i] || '—'}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {related.length > 0 && (
        <Card className="!p-0 overflow-hidden">
          <p className="border-b border-slate-100 px-5 py-3.5 text-[14.5px] font-extrabold">Linked Alerts ({related.length})</p>
          {related.map((a) => (
            <Link key={a.id} to="/alerts" className="flex items-center gap-3 border-b border-slate-50 px-5 py-3 last:border-0 hover:bg-gray-50">
              <span className={`h-2 w-2 rounded-full ${a.severity === 'Critical' ? 'bg-red-500' : 'bg-amber-500'}`} />
              <p className="text-[13px] font-bold">{a.title}</p>
              <span className="ml-auto font-mono text-[11.5px] text-slate-400">{a.alert_id}</span>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
