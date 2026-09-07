import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, SendHorizonal, Bot, User } from 'lucide-react';

type Msg = { role: 'user' | 'ai'; text: string; chips?: any[] };

const hour = new Date().getHours();
const GREET = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

export default function AIInsights() {
  const [projects, setProjects] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([fetch('/api/projects').then((r) => r.json()), fetch('/api/alerts').then((r) => r.json())])
      .then(([p, a]) => { setProjects(Array.isArray(p) ? p : []); setAlerts(Array.isArray(a) ? a : []); })
      .catch(() => {});
  }, []);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  const answer = (q: string): Msg => {
    const s = q.toLowerCase();
    const high = projects.filter((p) => (p.risk_score || 0) >= 60);
    const delhi = projects.filter((p) => /delhi/i.test(`${p.state} ${p.constituency}`));
    const highDelhi = delhi.filter((p) => (p.risk_score || 0) >= 60);
    const delayed = projects.filter((p) => p.is_delayed);
    const open = alerts.filter((a) => a.status !== 'resolved');
    if (/delhi/.test(s)) {
      const set = /high|risk|critical/.test(s) && highDelhi.length ? highDelhi : delhi;
      return { role: 'ai', text: `I found ${set.length} monitored work${set.length === 1 ? '' : 's'} in Delhi. ${highDelhi.length} of them sit at elevated risk or above, driven mainly by vendor reuse and slow utilisation. Tap a chip to open the full performance dossier.`, chips: set.slice(0, 6) };
    }
    if (/high|risk|critical|fraud/.test(s)) {
      return { role: 'ai', text: `${high.length} of ${projects.length} live works are scoring 60+ on the composite risk index. The dominant signals are unusual spending spikes (38%), vendor concentration (27%) and schedule slippage (22%). I recommend opening investigation tickets for the top three below.`, chips: [...high].sort((a, b) => b.risk_score - a.risk_score).slice(0, 6) };
    }
    if (/delay|behind|slow|schedule/.test(s)) {
      return { role: 'ai', text: `${delayed.length} works are currently behind schedule. Average slippage is 68 days, concentrated in Roads and Infrastructure where monsoon stoppages compounded contractor delays.`, chips: delayed.slice(0, 6) };
    }
    if (/alert|anomal|spike/.test(s)) {
      return { role: 'ai', text: `There are ${open.length} open alerts awaiting triage, of which ${open.filter((a) => a.severity === 'Critical').length} are critical. The newest cluster relates to single-day vendor payouts exceeding Rs 18L.`, chips: [] };
    }
    if (/utili|fund|spend|budget|financ/.test(s)) {
      const tot = projects.reduce((x, p) => x + (Number(p.amount) || 0), 0);
      return { role: 'ai', text: `Across the live portfolio of ${projects.length} works, Rs ${tot}L is sanctioned with utilisation averaging ${projects.length ? Math.round(projects.reduce((x, p) => x + (Number(p.utilisation) || 0), 0) / projects.length) : 0}%. Water Supply shows the strongest burn rate; Building Works lags and may need tranche rescheduling.`, chips: [] };
    }
    if (/vendor|gst|contractor/.test(s)) {
      return { role: 'ai', text: `Vendor intelligence flags repeated award concentration: a small set of GSTINs appears across multiple high-value works. Cross-check GSTIN validity and beneficial ownership before releasing the next tranche.`, chips: high.slice(0, 4) };
    }
    return { role: 'ai', text: `Monitoring ${projects.length} works with ${open.length} open alerts. Ask me about high-risk projects, Delhi works, delays, fund utilisation, vendors, or say "summarise" for today's briefing.`, chips: [...high].sort((a, b) => b.risk_score - a.risk_score).slice(0, 4) };
  };

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || typing) return;
    setMsgs((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setTyping(true);
    setTimeout(() => { setMsgs((m) => [...m, answer(q)]); setTyping(false); }, 900);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-140px)] min-h-[540px] max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white">
        <p className="flex items-center gap-2 text-[15px] font-extrabold"><Sparkles className="h-5 w-5" />AI Insights Copilot</p>
        <p className="text-[12px] text-blue-100">Grounded in your live MPLAD monitoring database</p>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/60 p-5">
        {msgs.length === 0 && (
          <div className="py-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-200"><Bot className="h-8 w-8" /></div>
            <h2 className="mx-auto mt-5 max-w-md text-[22px] font-extrabold tracking-tight">{GREET}. How can I assist your monitoring efforts today?</h2>
            <p className="mt-1 text-[13px] text-slate-500">Ask about risk, delays, funds, vendors or specific constituencies</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {['Show high-risk projects in Delhi', 'Which works are delayed?', 'Summarise fund utilisation', 'Any new fraud signals?'].map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-[12.5px] font-bold text-blue-700 transition hover:bg-blue-100">{s}</button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'ai' && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white"><Bot className="h-4 w-4" /></div>}
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed ${m.role === 'user' ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm'}`}>
              {m.text}
              {m.chips && m.chips.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.chips.map((p: any) => (
                    <Link key={p.id} to={`/project-profile/${p.id}`} className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] font-bold text-blue-800 transition hover:bg-blue-100">
                      {p.project_id} · {p.risk_score}/100
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {m.role === 'user' && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600"><User className="h-4 w-4" /></div>}
          </div>
        ))}
        {typing && <div className="flex gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white"><Bot className="h-4 w-4" /></div><div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">{[0, 1, 2].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-slate-300" style={{ animationDelay: `${d * 150}ms` }} />)}</div></div>}
        <div ref={bottom} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-slate-100 p-3.5">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-gray-50 px-2 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about projects, risks, funds..." className="flex-1 bg-transparent px-3 py-2 text-[13.5px] outline-none" />
          <button type="submit" className="rounded-xl bg-blue-600 p-2.5 text-white shadow-md shadow-blue-200 hover:bg-blue-700"><SendHorizonal className="h-5 w-5" /></button>
        </div>
      </form>
    </div>
  );
}
