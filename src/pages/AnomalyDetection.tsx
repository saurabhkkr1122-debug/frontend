import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Wallet, Timer, ShieldAlert } from 'lucide-react';
import { Card, Skeleton } from './Dashboard';

function SevBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    Critical: 'bg-red-500', Warning: 'bg-amber-500', High: 'bg-orange-500', Medium: 'bg-blue-500', Low: 'bg-emerald-500',
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white ${map[s] || 'bg-slate-500'}`}><span className="h-1.5 w-1.5 rounded-full bg-white" />{s}</span>;
}

export default function AnomalyDetection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sev, setSev] = useState('All');

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/anomalies${sev !== 'All' ? `?severity=${sev}` : ''}`);
      const d = await r.json();
      setItems(Array.isArray(d) ? d : []);
    } catch { setError('Failed to load anomaly feed.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [sev]);

  const crit = items.filter((i) => i.severity === 'Critical').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-l-4 !border-l-emerald-500">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600"><Activity className="h-6 w-6" /></div>
            <div><p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">System Status</p>
            <p className="flex items-center gap-2 text-[15px] font-extrabold">AI Monitoring Active <span className="relative flex h-2.5 w-2.5"><span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /></span></p></div>
          </div>
          <p className="mt-2 text-[12px] text-slate-500">14 models scoring every transaction · last sweep 2 min ago</p>
        </Card>
        <Card className="border-l-4 !border-l-blue-500">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><Wallet className="h-6 w-6" /></div>
            <div><p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Financial Analytics</p><p className="text-[15px] font-extrabold">99.8% scan coverage</p></div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[99.8%] rounded-full bg-blue-500" /></div>
        </Card>
        <Card className="border-l-4 !border-l-amber-500">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600"><Timer className="h-6 w-6" /></div>
            <div><p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">Project Delay</p><p className="text-[15px] font-extrabold">{crit} critical schedule flags</p></div>
          </div>
          <p className="mt-2 text-[12px] text-slate-500">Slippage beyond 45 days triggers auto-escalation</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[13px] font-bold text-slate-600">Filter anomalies:</p>
        {['All', 'Critical', 'Warning', 'High', 'Medium'].map((s) => (
          <button key={s} onClick={() => setSev(s)} className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition ${sev === s ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'}`}>{s}</button>
        ))}
        <select className="ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold" defaultValue="Last 7 days">
          <option>Last 24 hours</option><option>Last 7 days</option><option>Last 30 days</option><option>This FY</option>
        </select>
      </div>

      {loading ? <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-44" />)}</div>
      : error ? <div className="rounded-xl bg-red-50 p-6 text-center text-red-600">{error}</div>
      : items.length === 0 ? <Card><p className="py-8 text-center text-slate-400">No anomalies at this severity. The watch continues.</p></Card>
      : (
        <div className="space-y-3">
          {items.map((a) => (
            <Card key={a.id} className={`border-l-4 ${a.severity === 'Critical' ? '!border-l-red-500' : a.severity === 'Warning' ? '!border-l-amber-500' : '!border-l-blue-500'}`}>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-[12px] font-bold text-slate-400">{a.alert_id}</span>
                <SevBadge s={a.severity} />
                <span className="text-[12px] font-medium text-slate-400">{a.time_elapsed}</span>
                <Link to={a.project_id ? `/project-profile/${a.project_id}` : '/projects'} className="ml-auto flex items-center gap-1 text-[12.5px] font-bold text-blue-600 hover:underline"><ShieldAlert className="h-3.5 w-3.5" />Open dossier</Link>
              </div>
              <h3 className="mt-2 text-[16px] font-extrabold tracking-tight">{a.title}</h3>
              <p className="text-[12.5px] font-semibold text-slate-500">{a.project_name}</p>
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-[12px] font-bold"><span className="text-slate-500">AI CONFIDENCE SCORE</span><span className={a.confidence >= 90 ? 'text-red-600' : a.confidence >= 75 ? 'text-amber-600' : 'text-blue-600'}>{a.confidence}%</span></div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${a.confidence >= 90 ? 'bg-gradient-to-r from-red-500 to-orange-400' : a.confidence >= 75 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-blue-500 to-sky-400'}`} style={{ width: `${a.confidence}%` }} />
                </div>
              </div>
              <p className="mt-3 rounded-xl bg-slate-50 p-3.5 text-[13px] leading-relaxed text-slate-600"><span className="font-bold text-slate-800">AI explanation: </span>{a.explanation}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
