import { useEffect, useState } from 'react';
import { UserPlus, StickyNote, Paperclip, CheckCircle2, Send, X } from 'lucide-react';
import { Card, Skeleton } from './Dashboard';

const TABS = ['Critical', 'High', 'Medium', 'Resolved'];
const sevDot: Record<string, string> = { Critical: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-amber-400' };

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Critical');
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState('');
  const [noteOpen, setNoteOpen] = useState(false);
  const [toast, setToast] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/alerts');
      const d = await r.json();
      const list = Array.isArray(d) ? d : [];
      setAlerts(list);
      setSelected((prev: any) => {
        if (prev) { const still = list.find((a) => a.id === prev.id); if (still) return still; }
        return list.find((a) => a.severity === 'Critical' && a.status !== 'resolved') || list[0] || null;
      });
    } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const counts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Resolved: 0 };
  alerts.forEach((a) => { if (a.status === 'resolved') counts.Resolved += 1; else if (counts[a.severity] !== undefined) counts[a.severity] += 1; });
  const visible = alerts.filter((a) => (tab === 'Resolved' ? a.status === 'resolved' : a.severity === tab && a.status !== 'resolved'));

  const mutate = async (id: number, patch: any, msg: string) => {
    const r = await fetch('/api/alerts', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...patch }) });
    if (r.ok) { setToast(msg); setTimeout(() => setToast(''), 2600); load(); }
  };

  const addNote = () => {
    if (!note.trim() || !selected) return;
    const prev = selected.notes ? selected.notes + '\n' : '';
    mutate(selected.id, { notes: prev + '• ' + note.trim() }, 'Note added to investigation trail');
    setNote(''); setNoteOpen(false);
  };

  if (loading) return <div className="grid gap-4 lg:grid-cols-5"><Skeleton className="h-[560px] lg:col-span-2" /><Skeleton className="h-[560px] lg:col-span-3" /></div>;

  return (
    <div className="relative space-y-4">
      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-[13px] font-bold text-white shadow-2xl">{toast}</div>}
      <div className="grid items-start gap-4 lg:grid-cols-5">
        <Card className="!p-0 lg:col-span-2 overflow-hidden">
          <div className="grid grid-cols-4 border-b border-slate-100">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`relative px-2 py-3.5 text-[12.5px] font-bold transition ${tab === t ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}>
                {t}<span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10.5px] ${tab === t ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{counts[t]}</span>
                {tab === t && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-blue-600" />}
              </button>
            ))}
          </div>
          <div className="max-h-[560px] divide-y divide-slate-50 overflow-y-auto">
            {visible.map((a) => (
              <button key={a.id} onClick={() => setSelected(a)} className={`block w-full px-5 py-4 text-left transition ${selected?.id === a.id ? 'bg-blue-50/70 ring-1 ring-inset ring-blue-100' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${sevDot[a.severity] || 'bg-slate-400'}`} />
                  <p className="text-[13.5px] font-bold leading-snug">{a.title}</p>
                </div>
                <p className="mt-1 pl-4 text-[12.5px] text-slate-500">{a.project_name}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 pl-4">
                  <span className="font-mono text-[11px] text-slate-400">{a.alert_id}</span>
                  <span className="text-[11.5px] font-semibold text-slate-400">· {a.time_elapsed}</span>
                  {a.assignee && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10.5px] font-bold text-violet-700">{a.assignee}</span>}
                </div>
              </button>
            ))}
            {visible.length === 0 && <p className="px-5 py-12 text-center text-[13px] text-slate-400">No tickets in this queue.</p>}
          </div>
        </Card>
        <div className="lg:col-span-3">
          {!selected ? <Card><p className="py-16 text-center text-slate-400">Select an alert to begin investigation.</p></Card> : (
            <div className="space-y-4">
              <Card>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[12px] font-bold text-slate-400">{selected.alert_id}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase text-white ${selected.severity === 'Critical' ? 'bg-red-500' : selected.severity === 'High' ? 'bg-orange-500' : 'bg-amber-500'}`}>{selected.severity}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${selected.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{selected.status === 'resolved' ? 'Resolved' : selected.status === 'assigned' ? 'Assigned · ' + (selected.assignee || '') : 'Open'}</span>
                  <span className="ml-auto text-[12px] font-medium text-slate-400">{selected.time_elapsed}</span>
                </div>
                <h2 className="mt-2 text-[19px] font-extrabold tracking-tight">{selected.title}</h2>
                <p className="text-[13px] font-semibold text-slate-500">{selected.project_name} · {selected.project_id}</p>
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-[13px] font-extrabold uppercase tracking-wide text-red-700">AI Assessment Summary</p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-red-900/80">{selected.assessment}</p>
                </div>
                {selected.notes && (
                  <div className="mt-3 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100">
                    <p className="text-[12px] font-extrabold uppercase tracking-wide text-amber-700">Investigation trail</p>
                    <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-slate-700">{selected.notes}</p>
                  </div>
                )}
              </Card>
              <Card>
                <p className="mb-3 text-[13px] font-extrabold uppercase tracking-wide text-slate-500">Response actions</p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <button onClick={() => mutate(selected.id, { status: 'assigned', assignee: 'S. Iyer (Vigilance)' }, 'Investigation assigned to S. Iyer')} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-[13.5px] font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700"><UserPlus className="h-4 w-4" />Assign Investigation</button>
                  <button onClick={() => mutate(selected.id, { status: 'resolved' }, 'Alert marked resolved')} className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-[13.5px] font-bold text-white shadow-md shadow-orange-200 hover:bg-orange-600"><CheckCircle2 className="h-4 w-4" />Resolve Alert</button>
                  <button onClick={() => setNoteOpen((v) => !v)} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-[13.5px] font-bold text-slate-700 hover:bg-gray-50"><StickyNote className="h-4 w-4" />Add Note</button>
                  <button onClick={() => mutate(selected.id, { evidence_count: (selected.evidence_count || 0) + 1 }, 'Evidence bundle attached')} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-[13.5px] font-bold text-slate-700 hover:bg-gray-50"><Paperclip className="h-4 w-4" />Upload Evidence{selected.evidence_count ? ` (${selected.evidence_count})` : ''}</button>
                </div>
                {noteOpen && (
                  <div className="mt-3 rounded-xl border border-slate-200 p-3">
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Record an observation for the case file..." className="w-full rounded-lg bg-gray-50 p-3 text-[13.5px] outline-none focus:ring-2 focus:ring-blue-200" />
                    <div className="mt-2 flex justify-end gap-2">
                      <button onClick={() => setNoteOpen(false)} className="flex items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-bold text-slate-500 hover:bg-gray-100"><X className="h-4 w-4" />Cancel</button>
                      <button onClick={addNote} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-bold text-white hover:bg-slate-700"><Send className="h-3.5 w-3.5" />Save note</button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
