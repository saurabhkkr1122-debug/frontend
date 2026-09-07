import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Cloud, Smartphone, Eye, EyeOff, Landmark, Mail } from 'lucide-react';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('officer@gov.in');
  const [password, setPassword] = useState('password123');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    localStorage.setItem('mplad_auth', JSON.stringify({ email, ts: Date.now() }));
    nav('/dashboard');
  };

  return (
    <div className="flex min-h-screen font-[Inter,system-ui,sans-serif]">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-200 p-10 lg:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/40 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-blue-300/40 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-300">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[17px] font-extrabold text-slate-900">MPLAD Portal</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700">GovTech Enterprise</p>
          </div>
        </div>
        <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4">
          <div className="col-span-2 mx-auto flex h-36 w-36 rotate-3 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl shadow-blue-400">
            <ShieldCheck className="h-16 w-16" strokeWidth={1.5} />
          </div>
          <div className="flex -rotate-2 items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-xl shadow-blue-200/50 backdrop-blur">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><Lock className="h-6 w-6" /></div>
            <div><p className="text-[13px] font-bold text-slate-800">256-bit lock</p><p className="text-[11px] text-slate-500">Bank-grade vault</p></div>
          </div>
          <div className="flex rotate-2 items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-xl shadow-blue-200/50 backdrop-blur">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600"><Cloud className="h-6 w-6" /></div>
            <div><p className="text-[13px] font-bold text-slate-800">GovCloud sync</p><p className="text-[11px] text-slate-500">Real-time mirror</p></div>
          </div>
          <div className="col-span-2 flex items-center gap-3 rounded-2xl bg-slate-900 p-4 text-white shadow-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10"><Smartphone className="h-6 w-6" /></div>
            <div><p className="text-[13px] font-bold">Monitor from anywhere</p><p className="text-[11px] text-slate-300">Field-verified updates on your phone</p></div>
            <span className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />Live</span>
          </div>
        </div>
        <div className="relative">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome Back</h2>
          <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-slate-600">Securely access your dashboard to manage systems and monitor performance across every MPLAD constituency.</p>
          <div className="mt-4 flex gap-2">
            {['AI Surveillance', 'Fund Tracking', 'Geo Intelligence'].map((t) => (
              <span key={t} className="rounded-full bg-white/70 px-3 py-1 text-[11.5px] font-semibold text-blue-800 shadow-sm">{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-center bg-white p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white"><Landmark className="h-5 w-5" /></div>
            <p className="font-extrabold">MPLAD Portal</p>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Sign In</h1>
          <p className="mt-1.5 text-[14px] text-slate-500">Access the AI monitoring command centre</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="officer@gov.in" className="w-full rounded-xl border border-slate-200 bg-gray-50 py-3 pl-10 pr-4 text-[14px] outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full rounded-xl border border-slate-200 bg-gray-50 py-3 pl-10 pr-11 text-[14px] outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] font-medium text-red-600">{error}</p>}
            <div className="flex items-center justify-between text-[13px]">
              <label className="flex cursor-pointer items-center gap-2 font-medium text-slate-600">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded accent-blue-600" /> Remember me
              </label>
              <button type="button" className="font-semibold text-blue-600 hover:underline">Forgot password?</button>
            </div>
            <button type="submit" className="w-full rounded-xl bg-blue-600 py-3 text-[15px] font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.99]">Sign In</button>
            <p className="text-center text-[13.5px] text-slate-500">New to the portal? <Link to="/dashboard" onClick={() => localStorage.setItem('mplad_auth', JSON.stringify({ email: 'guest@gov.in', ts: Date.now() }))} className="font-bold text-blue-600 hover:underline">Sign up</Link></p>
          </form>
          <div className="mt-8 rounded-xl border border-slate-100 bg-gray-50 p-3.5 text-[12px] leading-relaxed text-slate-500">
            Protected by NIC GovCloud · ISO 27001 certified · All access is logged per IT Act audit requirements.
          </div>
        </div>
      </div>
    </div>
  );
}
