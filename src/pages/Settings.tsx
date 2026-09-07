import { useEffect, useState } from 'react';
import { Bell, BellOff, Save, User } from 'lucide-react';
import { Card } from './Dashboard';

export default function Settings() {
  const [name, setName] = useState('District Officer');
  const [email, setEmail] = useState('officer@gov.in');
  const [district, setDistrict] = useState('New Delhi');
  const [notif, setNotif] = useState(true);
  const [daily, setDaily] = useState(true);
  const [critical, setCritical] = useState(80);
  const [elevated, setElevated] = useState(60);
  const [toast, setToast] = useState('');

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('mplad_settings') || '{}');
      if (s.name) setName(s.name);
      if (s.email) setEmail(s.email);
      if (s.district) setDistrict(s.district);
      if (s.notif !== undefined) setNotif(s.notif);
      if (s.critical) setCritical(s.critical);
      if (s.elevated) setElevated(s.elevated);
    } catch {}
  }, []);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setToast('Enter a valid email'); setTimeout(() => setToast(''), 2600); return; }
    localStorage.setItem('mplad_settings', JSON.stringify({ name, email, district, notif, critical, elevated }));
    setToast('Settings saved successfully');
    setTimeout(() => setToast(''), 2600);
  };

  return (
    <div className="relative mx-auto max-w-3xl space-y-4">
      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-[13px] font-bold text-white shadow-2xl">{toast}</div>}
      <Card>
        <p className="flex items-center gap-2 text-[15px] font-extrabold"><User className="h-5 w-5 text-blue-600" />Profile</p>
        <form onSubmit={save} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1.5 block text-[13px] font-semibold text-slate-600">Full name</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-gray-50 px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue-500 focus:bg-white" /></div>
          <div><label className="mb-1.5 block text-[13px] font-semibold text-slate-600">Official email</label><input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-gray-50 px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue-500 focus:bg-white" /></div>
          <div className="sm:col-span-2"><label className="mb-1.5 block text-[13px] font-semibold text-slate-600">Nodal district</label><input value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-gray-50 px-3.5 py-2.5 text-[13.5px] outline-none focus:border-blue-500 focus:bg-white" /></div>
          <div className="sm:col-span-2"><button className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-blue-700"><Save className="h-4 w-4" />Save changes</button></div>
        </form>
      </Card>
      <Card>
        <p className="flex items-center gap-2 text-[15px] font-extrabold">{notif ? <Bell className="h-5 w-5 text-blue-600" /> : <BellOff className="h-5 w-5 text-slate-400" />}Notifications</p>
        {[{ l: 'Real-time critical alerts', d: 'Push on every Critical anomaly', v: notif, f: setNotif }, { l: 'Daily district digest', d: 'Morning summary at 09:00 IST', v: daily, f: setDaily }].map((r) => (
          <div key={r.l} className="mt-3 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <div><p className="text-[13.5px] font-bold">{r.l}</p><p className="text-[12px] text-slate-500">{r.d}</p></div>
            <button type="button" onClick={() => r.f(!r.v)} className={`relative h-6 w-11 rounded-full transition ${r.v ? 'bg-blue-600' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${r.v ? 'left-[22px]' : 'left-0.5'}`} /></button>
          </div>
        ))}
      </Card>
      <Card>
        <p className="text-[15px] font-extrabold">Detection Thresholds</p>
        <p className="text-[12.5px] text-slate-500">Scores at or above these values trigger bands</p>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-[13px] font-bold"><span className="text-slate-600">Critical band at</span><span className="text-red-600">{critical}/100</span></div>
          <input type="range" min={10} max={95} value={critical} onChange={(e) => setCritical(Number(e.target.value))} className="w-full accent-blue-600" />
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-[13px] font-bold"><span className="text-slate-600">Elevated band at</span><span className="text-amber-600">{elevated}/100</span></div>
          <input type="range" min={10} max={95} value={elevated} onChange={(e) => setElevated(Number(e.target.value))} className="w-full accent-blue-600" />
        </div>
        <button onClick={save} className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-[13.5px] font-bold text-white hover:bg-slate-700">Apply thresholds</button>
      </Card>
    </div>
  );
}
