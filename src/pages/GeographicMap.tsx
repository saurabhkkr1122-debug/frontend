import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Plus, Minus, Maximize2, ExternalLink } from 'lucide-react';
import { Card, Skeleton } from './Dashboard';

type Marker = { id: string; name: string; state: string; x: number; y: number; risk: number; level: 'Low' | 'Medium' | 'High'; allocation: number; utilisation: number };

const MARKERS: Marker[] = [
  { id: 'dl', name: 'New Delhi District', state: 'Delhi', x: 44, y: 28, risk: 84, level: 'High', allocation: 142, utilisation: 61 },
  { id: 'lk', name: 'Lucknow District', state: 'Uttar Pradesh', x: 53, y: 34, risk: 66, level: 'Medium', allocation: 118, utilisation: 72 },
  { id: 'jp', name: 'Jaipur District', state: 'Rajasthan', x: 35, y: 39, risk: 41, level: 'Low', allocation: 96, utilisation: 84 },
  { id: 'ah', name: 'Ahmedabad District', state: 'Gujarat', x: 27, y: 52, risk: 58, level: 'Medium', allocation: 88, utilisation: 77 },
  { id: 'mb', name: 'Mumbai Suburban', state: 'Maharashtra', x: 31, y: 62, risk: 79, level: 'High', allocation: 164, utilisation: 58 },
  { id: 'pl', name: 'Patna District', state: 'Bihar', x: 63, y: 37, risk: 73, level: 'High', allocation: 104, utilisation: 55 },
  { id: 'kl', name: 'Kolkata North', state: 'West Bengal', x: 68, y: 49, risk: 47, level: 'Low', allocation: 92, utilisation: 81 },
  { id: 'hy', name: 'Hyderabad District', state: 'Telangana', x: 46, y: 70, risk: 52, level: 'Medium', allocation: 110, utilisation: 74 },
  { id: 'bn', name: 'Bengaluru Urban', state: 'Karnataka', x: 43, y: 81, risk: 35, level: 'Low', allocation: 128, utilisation: 88 },
  { id: 'ch', name: 'Chennai Central', state: 'Tamil Nadu', x: 54, y: 83, risk: 69, level: 'Medium', allocation: 99, utilisation: 66 },
];

const dot: Record<string, string> = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };

export default function GeographicMap() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateF, setStateF] = useState('All');
  const [riskF, setRiskF] = useState('All');
  const [sel, setSel] = useState<Marker>(MARKERS[0]);
  const [gzoom, setGzoom] = useState(5);

  useEffect(() => {
    fetch('/api/projects').then((r) => r.json()).then((d) => setProjects(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const states = useMemo(() => ['All', ...Array.from(new Set(MARKERS.map((m) => m.state)))], []);
  const visible = MARKERS.filter((m) => (stateF === 'All' || m.state === stateF) && (riskF === 'All' || m.level === riskF));
  const selProjects = projects.filter((p) => p.state === sel.state).slice(0, 3);
  const ranked = useMemo(() => [...visible].sort((a, b) => b.risk - a.risk).slice(0, 5), [visible]);
  const counts = useMemo(() => ({
    high: MARKERS.filter((m) => m.level === 'High').length,
    med: MARKERS.filter((m) => m.level === 'Medium').length,
    low: MARKERS.filter((m) => m.level === 'Low').length,
    totalAlloc: MARKERS.reduce((s, m) => s + m.allocation, 0),
  }), []);
  const avgRisk = Math.round(visible.reduce((s, m) => s + m.risk, 0) / Math.max(1, visible.length));

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="text-[13px] font-extrabold text-slate-600">Filter map:</p>
          <label className="text-[12.5px] font-semibold text-slate-500">State</label>
          <select value={stateF} onChange={(e) => setStateF(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold outline-none focus:border-blue-500">
            {states.map((s) => <option key={s}>{s}</option>)}
          </select>
          <label className="text-[12.5px] font-semibold text-slate-500">Risk Level</label>
          <select value={riskF} onChange={(e) => setRiskF(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold outline-none focus:border-blue-500">
            {['All', 'Low', 'Medium', 'High'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <div className="ml-auto flex items-center gap-3 text-[12px] font-bold text-slate-500">
            {[['Low', '#10b981'], ['Medium', '#f59e0b'], ['High', '#ef4444']].map(([l, c]) => (
              <span key={l} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />{l}</span>
            ))}
          </div>
        </div>
      </Card>

      {loading ? <Skeleton className="h-[560px]" /> : (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="relative h-[560px] w-full overflow-hidden bg-slate-100">
            {/* Real Google Map of India (embed, no API key needed) */}
            <iframe
              title="Google Map of India — MPLAD district risk"
              src={`https://www.google.com/maps?q=India&z=${gzoom}&output=embed`}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            {/* soft top scrim so header chips stay legible */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/70 to-transparent" />

            {/* header chips */}
            <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
              <span className="rounded-xl bg-slate-900/90 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white shadow-lg backdrop-blur">India · MPLAD Risk Grid</span>
              <span className="rounded-xl bg-white/95 px-3 py-1.5 text-[11.5px] font-bold text-slate-600 shadow backdrop-blur">
                {visible.length} districts · Avg risk <span className={`font-mono ${avgRisk >= 70 ? 'text-red-600' : avgRisk >= 50 ? 'text-amber-600' : 'text-emerald-600'}`}>{avgRisk}/100</span>
              </span>
              <a href="https://www.google.com/maps/search/?api=1&query=India" target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-xl bg-white/95 px-3 py-1.5 text-[11.5px] font-bold text-blue-700 shadow backdrop-blur hover:bg-white">
                <ExternalLink className="h-3.5 w-3.5" />Google Maps
              </a>
            </div>

            {/* zoom controls drive the real Google Map zoom */}
            <div className="absolute right-4 top-4 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur">
              <button onClick={() => setGzoom((z) => Math.min(10, z + 1))} title="Zoom in" className="p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Plus className="h-4 w-4" /></button>
              <span className="border-y border-slate-100 py-0.5 text-center text-[10px] font-extrabold text-slate-400">z{gzoom}</span>
              <button onClick={() => setGzoom((z) => Math.max(4, z - 1))} title="Zoom out" className="p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Minus className="h-4 w-4" /></button>
              <button onClick={() => setGzoom(5)} title="Reset view" className="border-t border-slate-100 p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Maximize2 className="h-4 w-4" /></button>
            </div>

            {/* district quick-rank overlay */}
            <div className="absolute left-4 top-16 hidden w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur md:block">
              <p className="border-b border-slate-100 px-3.5 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Highest risk · top {ranked.length}</p>
              {ranked.map((m, i) => (
                <button key={m.id} onClick={() => setSel(m)} className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition ${sel.id === m.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <span className="w-4 text-[11px] font-extrabold text-slate-300">{i + 1}</span>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white" style={{ background: dot[m.level] }} />
                  <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-slate-700">{m.name}</span>
                  <span className={`font-mono text-[12px] font-extrabold ${m.risk >= 70 ? 'text-red-600' : m.risk >= 50 ? 'text-amber-600' : 'text-emerald-600'}`}>{m.risk}</span>
                </button>
              ))}
              <div className="flex items-center justify-between border-t border-slate-100 bg-gray-50/70 px-3.5 py-2 text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />{counts.high} High</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />{counts.med} Med</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />{counts.low} Low</span>
              </div>
            </div>

            {/* risk markers over the Google Map */}
            {visible.map((m) => {
              const size = 15 + m.allocation / 55;
              const active = sel.id === m.id;
              return (
                <button key={m.id} onClick={() => setSel(m)} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${m.x}%`, top: `${m.y}%` }} title={`${m.name} · Risk ${m.risk}/100`}>
                  {m.level === 'High' && <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full opacity-30" style={{ background: dot[m.level], width: size * 2.4, height: size * 2.4 }} />}
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25" style={{ background: dot[m.level], width: size * 1.9, height: size * 1.9 }} />
                  <span className={`relative block rounded-full shadow-lg transition group-hover:scale-125 ${active ? 'scale-150 ring-4 ring-white' : 'ring-[3px] ring-white/90'}`} style={{ background: dot[m.level], width: size, height: size }} />
                  <span className={`pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11.5px] font-bold shadow-xl ${active ? 'block bg-blue-700 text-white' : 'hidden bg-slate-900 text-white group-hover:block'}`}>
                    {m.name} · {m.risk}/100
                  </span>
                </button>
              );
            })}

            {/* bottom-left totals strip */}
            <div className="absolute bottom-4 left-4 hidden items-center gap-4 rounded-2xl border border-slate-200 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur sm:flex">
              <div><p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Districts live</p><p className="text-[16px] font-extrabold">{MARKERS.length}</p></div>
              <div className="h-8 w-px bg-slate-200" />
              <div><p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total allocation</p><p className="text-[16px] font-extrabold">Rs {counts.totalAlloc}L</p></div>
            </div>

            {/* floating detail card */}
            <div className="absolute bottom-4 right-4 w-72 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400"><MapPin className="h-3.5 w-3.5 text-blue-600" />Selected region</p>
              <h3 className="mt-1 text-[16px] font-extrabold tracking-tight">{sel.name}</h3>
              <div className="mt-3 space-y-2 text-[13px]">
                <div className="flex justify-between"><span className="text-slate-500">Total Allocation</span><span className="font-extrabold">Rs {sel.allocation}L</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Utilisation</span><span className="font-extrabold">{sel.utilisation}%</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${sel.utilisation}%` }} /></div>
                <div className="flex justify-between"><span className="text-slate-500">Overall Risk Score</span><span className={`font-mono font-extrabold ${sel.risk >= 70 ? 'text-red-600' : sel.risk >= 50 ? 'text-amber-600' : 'text-emerald-600'}`}>{sel.risk}/100 · {sel.level}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${sel.risk >= 70 ? 'bg-red-500' : sel.risk >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${sel.risk}%` }} /></div>
              </div>
              {selProjects.length > 0 && (
                <div className="mt-2 space-y-1 border-t border-slate-100 pt-2">
                  {selProjects.map((p) => (
                    <Link key={p.id} to={`/project-profile/${p.id}`} className="block truncate text-[12px] font-semibold text-blue-700 hover:underline">{p.project_id} · {p.name}</Link>
                  ))}
                </div>
              )}
              <Link to={`/projects?q=${encodeURIComponent(sel.state)}`} className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-[13px] font-bold text-white hover:bg-blue-700">View Detailed Report <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
