import { useEffect, useMemo, useState } from 'react';
import { FileText, Download, CalendarClock, Plus } from 'lucide-react';
import { Card, Skeleton } from './Dashboard';

const TEMPLATES = [
  { t: 'Fund Utilisation Certificate', d: 'GFR 12-A compliant UC for district release tranches', icon: 'UC' },
  { t: 'Monthly Progress Review', d: 'Physical vs financial progress across live works', icon: 'MPR' },
  { t: 'Fraud & Anomaly Dossier', d: 'AI-flagged entities, alerts and investigation status', icon: 'FR' },
  { t: 'Completion & Handover Pack', d: 'Asset register, geo-tagged evidence and NOC set', icon: 'CH' },
];

export default function Reports() {
  const [projects, setProjects] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduled, setScheduled] = useState<string[]>(['Monthly Progress Review']);
  const [toast, setToast] = useState('');

  useEffect(() => {
    Promise.all([fetch('/api/projects').then((r) => r.json()), fetch('/api/alerts').then((r) => r.json())])
      .then(([p, a]) => { setProjects(Array.isArray(p) ? p : []); setAlerts(Array.isArray(a) ? a : []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const history = useMemo(() => [
    { n: 'MPR_August_2026.pdf', meta: `${projects.length} works · generated 02 Sep 2026`, s: 'Ready' },
    { n: 'Fraud_Dossier_Q2.pdf', meta: `${alerts.filter((a) => a.status !== 'resolved').length} open alerts · generated 28 Aug 2026`, s: 'Ready' },
    { n: 'UC_Tranche_III.pdf', meta: 'GFR 12-A · generated 14 Aug 2026', s: 'Signed' },
  ], [projects, alerts]);

  const downloadCSV = (kind: string) => {
    const rows = kind === 'alerts' ? alerts : projects;
    if (!rows.length) return;
    const headers = Object.keys(rows[0]).filter((k) => k !== 'notes');
    const csv = [headers.join(','), ...rows.map((r: any) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `mplad_${kind}_${Date.now()}.csv`;
    a.click();
    setToast(`${kind === 'alerts' ? 'Alert' : 'Project'} register exported as CSV`);
    setTimeout(() => setToast(''), 2600);
  };

  const toggleSchedule = (t: string) => {
    setScheduled((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));
    setToast('Report schedule updated');
    setTimeout(() => setToast(''), 2600);
  };

  if (loading) return <Skeleton className="h-96" />;

  return (
    <div className="relative space-y-4">
      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-[13px] font-bold text-white shadow-2xl">{toast}</div>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TEMPLATES.map((t) => (
          <Card key={t.t}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-[13px] font-extrabold text-white">{t.icon}</div>
            <h3 className="mt-3 text-[14.5px] font-extrabold leading-snug">{t.t}</h3>
            <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">{t.d}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => downloadCSV('projects')} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2 text-[12.5px] font-bold text-white hover:bg-slate-700"><Download className="h-3.5 w-3.5" />Export</button>
              <button onClick={() => toggleSchedule(t.t)} title="Toggle schedule" className={`rounded-lg p-2 ring-1 ${scheduled.includes(t.t) ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' : 'text-slate-400 ring-slate-200 hover:bg-gray-50'}`}><CalendarClock className="h-4 w-4" /></button>
            </div>
            {scheduled.includes(t.t) && <p className="mt-2 text-[11.5px] font-bold text-emerald-600">Auto-emailed on the 1st, 09:00 IST</p>}
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="!p-0 overflow-hidden">
          <p className="border-b border-slate-100 px-5 py-4 text-[15px] font-extrabold">Recent Reports</p>
          {history.map((h) => (
            <div key={h.n} className="flex items-center gap-3 border-b border-slate-50 px-5 py-3.5 last:border-0">
              <div className="rounded-lg bg-red-50 p-2 text-red-500"><FileText className="h-5 w-5" /></div>
              <div><p className="font-mono text-[13px] font-bold">{h.n}</p><p className="text-[12px] text-slate-500">{h.meta}</p></div>
              <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">{h.s}</span>
            </div>
          ))}
        </Card>
        <Card>
          <p className="text-[15px] font-extrabold">One-click Registers</p>
          <p className="text-[12.5px] text-slate-500">Live CSV exports straight from the monitoring database</p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <button onClick={() => downloadCSV('projects')} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-[13.5px] font-bold text-white hover:bg-blue-700"><Download className="h-4 w-4" />Project register ({projects.length})</button>
            <button onClick={() => downloadCSV('alerts')} className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-[13.5px] font-bold text-white hover:bg-orange-600"><Download className="h-4 w-4" />Alert register ({alerts.length})</button>
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-3.5 text-[12.5px] leading-relaxed text-slate-600">
            <p className="flex items-center gap-1.5 font-bold text-slate-800"><Plus className="h-4 w-4" />Custom dossier builder</p>
            Combine UC, MPR and fraud annexures into a single collector-ready PDF. Contact the NIC cell to enable e-sign stamping.
          </div>
        </Card>
      </div>
    </div>
  );
}
