import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import logo from '../assets/logo-high.jpg';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [remember, setRemember] = useState(true);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setMsg('');
    setLoading(true);
    try {
      const result = await login(email.trim(), pwd, remember);
      
      // Redirect based on user role
      const userRole = result?.user?.role;
      if (userRole === 'technician') {
        nav('/tech-view');
      } else {
        nav('/app');
      }
    } catch (err) {
      setMsg(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg grid place-items-center px-4 text-white">
      <div className="panel w-full max-w-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Call-a-Technician" className="h-12 w-auto rounded-md mb-2" />
          <h1 className="text-3xl font-extrabold">Welcome back</h1>
          <p className="text-white/80 mt-1">Log in to access your dashboard.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input type="email" className="input mt-1" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <label className="text-sm text-slate-300">Password</label>
            <div className="relative mt-1">
              <input type={showPwd ? 'text' : 'password'} className="input pr-16" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="••••••••" required />
              <button type="button" className="absolute right-2 top-1.5 text-brand-psky hover:underline" onClick={()=>setShowPwd(s=>!s)}>
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} />
              Remember me
            </label>
          </div>

          <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75">
            Accounts are created by an administrator.
          </p>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn btn-blue disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </div>
          {msg && <p className="text-rose-300 text-sm">{msg}</p>}
        </form>
      </div>
    </div>
  );
}
