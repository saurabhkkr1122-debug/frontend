import { useState } from 'react';
import { RotateCcw, FlaskConical, Gauge, Play, Save } from 'lucide-react';
import { Card } from './Dashboard';

const SECTORS = ['Roads & Infrastructure', 'Water Supply', 'Education', 'Healthcare', 'Building Works', 'Sanitation', 'Electrification', 'Sports & Community'];

const EMPTY = { title: '', constituency: '', sector: 'Roads & Infrastructure', nodal_district: '', implementing_agency: '', vendor_gstin: '', amount: '', duration_months: '12' };
const SAMPLE = { title: 'CC Road & Drain from Block Office to PHC Gate', constituency: 'New Delhi', sector: 'Roads & Infrastructure', nodal_district: 'New Delhi', implementing_agency: 'CPWD Division IV', vendor_gstin: '07ABCDE1234F1Z5', amount: '68', duration_months: '5' };

export default function RiskPredictor() {
  const [form, setForm] = useState({ ...EMPTY });
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState('');

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const run = async () => {
    setBusy(true);
    try {
      const r = await fetch('/api/risk-predict', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, amount: Number(form.amount) || 0, duration_months: Number(form.duration_months) || 12 }) });
      const d = await r.json();
      setResult(d);
    } catch { setResult(null); }
    finally { setBusy(false); }
  };

  const saveAsProject = async () => {
    if (!result) return;
    const band = result.score >= 80 ? 'Critical' : result.score >= 60 ? 'Elevated' : result.score >= 35 ? 'Delayed' : 'Low Risk';
    const r = await fetch('/api/projects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: `MPLAD/2026/SIM-${Math.floor(100 + Math.random() * 900)}`,
        name: form.title || 'Simulated work', constituency: form.constituency || 'Unassigned', state: 'Delhi',
        amount: Number(form.amount) || 10, progress: 0, status: band, sector: form.sector,
        nodal_district: form.nodal_district || 'New Delhi', implementing_agency: form.implementing_agency || 'TBD',
        vendor_name: 'Simulated vendor', vendor_gstin: form.vendor_gstin, risk_score: result.score,
        anomaly_score: Math.min(99, result.score - 4), utilisation: 0, is_delayed: false,
        sanctioned_date: '2026-09-01', started_date: '2026-09-01', expected_completion: '2027-06-30',
        description: 'Created from the risk simulator.',
      }),
    });
    if (r.ok) { setSaved('Simulation saved to Project Monitoring'); setTimeout(() => setSaved(''), 2600); }
  };

  const bandBg = result ? (result.score >= 80 ? 'bg-red-500' : result.score >= 60 ? 'bg-amber-500' : result.score >= 35 ? 'bg-orange-500' : 'bg-emerald-500') : 'bg-slate-200';
  const input = 'w-full rounded-xl border border-slate-200 bg-gray-50 px-3.5 py-2.5 text-[13.5px] outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100';
  const label = 'mb-1.5 block text-[13px] font-semibold text-slate-600';

  return (
    <div className="relative grid items-start gap-4 lg:grid-cols-2">
      {saved && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-[13px] font-bold text-white shadow-2xl">{saved}</div>}
      <Card>
        <h3 className="text-[15px] font-extrabold">Proposed Work Dossier</h3>
        <p className="text-[12.5px] text-slate-500">Enter sanction details — the engine scores live as you type</p>
        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className={label}>Project Title</label><input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Community hall at Ward 12" className={input} /></div>
          <div><label className={label}>Constituency</label><input value={form.constituency} onChange={(e) => set('constituency', e.target.value)} placeholder="e.g. New Delhi" className={input} /></div>
          <div><label className={label}>Sector</label><select value={form.sector} onChange={(e) => set('sector', e.target.value)} className={input}>{SECTORS.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><label className={label}>Nodal District</label><input value={form.nodal_district} onChange={(e) => set('nodal_district', e.target.value)} placeholder="e.g. New Delhi" className={input} /></div>
          <div><label className={label}>Implementing Agency</label><input value={form.implementing_agency} onChange={(e) => set('implementing_agency', e.target.value)} placeholder="e.g. CPWD Division IV" className={input} /></div>
          <div><label className={label}>Vendor GSTIN</label><input value={form.vendor_gstin} onChange={(e) => set('vendor_gstin', e.target.value)} placeholder="15-char GSTIN" className={`${input} font-mono uppercase`} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>Amount (Rs L)</label><input type="number" min={0} value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="45" className={input} /></div>
            <div><label className={label}>Duration (mo)</label><input type="number" min={1} value={form.duration_months} onChange={(e) => set('duration_months', e.target.value)} className={input} /></div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button onClick={() => { setForm({ ...EMPTY }); setResult(null); }} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-gray-50"><RotateCcw className="h-4 w-4" />Reset</button>
          <button onClick={() => setForm({ ...SAMPLE })} className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-[13px] font-bold text-blue-700 hover:bg-blue-100"><FlaskConical className="h-4 w-4" />Load Sample Project</button>
          <button onClick={run} disabled={busy} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-60"><Play className="h-4 w-4" />{busy ? 'Scoring...' : 'Run Assessment'}</button>
        </div>
      </Card>

      <Card className="border-t-4 !border-t-blue-600">
        <p className="flex items-center gap-2 text-[15px] font-extrabold"><Gauge className="h-5 w-5 text-blue-600" />Live Risk Assessment Engine</p>
        {!result ? (
          <div className="py-14 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Gauge className="h-9 w-9" /></div>
            <p className="mt-4 text-[13.5px] font-semibold text-slate-500">Fill the dossier and run the assessment.<br />Five risk factors are scored out of 100.</p>
          </div>
        ) : (
          <>
            <div className="mt-4 rounded-2xl bg-slate-900 p-5 text-center text-white">
              <p className={`text-5xl font-extrabold tracking-tight ${result.score >= 80 ? 'text-red-400' : result.score >= 60 ? 'text-amber-400' : 'text-emerald-400'}`}>{result.score}<span className="text-xl text-slate-400">/100</span></p>
              <p className="mt-1 text-[15px] font-extrabold uppercase tracking-widest text-slate-200">{result.band}</p>
              <div className="mx-auto mt-3 h-2.5 max-w-xs overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${bandBg}`} style={{ width: `${result.score}%` }} /></div>
            </div>
            <p className="mb-2 mt-5 text-[13px] font-extrabold uppercase tracking-wide text-slate-500">Multi-factor risk breakdown</p>
            <div className="space-y-3">
              {result.breakdown.map((b: any) => (
                <div key={b.factor}>
                  <div className="mb-1 flex items-center justify-between text-[12.5px] font-bold"><span>{b.factor}</span><span className="font-mono text-slate-500">{b.score}/{b.max}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${b.score / b.max > 0.66 ? 'bg-red-500' : b.score / b.max > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${(b.score / b.max) * 100}%` }} /></div>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{b.detail}</p>
                </div>
              ))}
            </div>
            <button onClick={saveAsProject} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-gray-50"><Save className="h-4 w-4" />Save simulation to monitoring</button>
          </>
        )}
      </Card>
    </div>
  );
}
