import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import logo from '../assets/logo-high.webp';

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
    <div className="login-page page flex min-h-screen items-center justify-center px-4 py-6 text-white sm:px-6 lg:py-10">
      <style>{`
        .login-page {
          position: relative;
          overflow: hidden;
          background: #000154;
        }

        .login-page::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 18% 12%, rgba(82, 213, 255, 0.14), transparent 34%),
            radial-gradient(circle at 84% 88%, rgba(34, 197, 94, 0.10), transparent 36%),
            linear-gradient(135deg, #000154 0%, #08115f 48%, #000154 100%);
          background-size: 140% 140%;
          animation: loginNavyShift 18s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .login-shell {
          position: relative;
          z-index: 1;
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 26px 80px rgba(0, 0, 0, 0.34);
        }

        .login-info-card {
          border-left: 3px solid rgba(82, 213, 255, 0.72);
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background-color 180ms ease;
        }

        .login-info-card:hover {
          transform: translateY(-2px);
          border-color: rgba(82, 213, 255, 0.34);
          border-left-color: rgba(49, 238, 136, 0.78);
          background-color: rgba(255, 255, 255, 0.06);
          box-shadow: 0 16px 38px rgba(0, 0, 0, 0.22);
        }

        .login-form-card {
          animation: loginCardIn 420ms ease-out both;
        }

        .login-input {
          border-color: rgba(255, 255, 255, 0.22);
          transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
        }

        .login-input:focus {
          border-color: rgba(49, 238, 136, 0.74);
          box-shadow: 0 0 0 3px rgba(49, 238, 136, 0.16), 0 0 22px rgba(82, 213, 255, 0.12);
          background-color: rgba(0, 1, 84, 0.68);
        }

        .login-primary {
          background: #22C55E;
          border-color: rgba(134, 239, 172, 0.5);
          color: #03140a;
          cursor: pointer;
          transition: filter 160ms ease, transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
          box-shadow: 0 12px 30px rgba(34, 197, 94, 0.22);
        }

        .login-primary:hover:not(:disabled) {
          filter: brightness(1.06);
          transform: translateY(-1px);
          box-shadow: 0 16px 38px rgba(34, 197, 94, 0.26);
        }

        .login-primary:disabled {
          cursor: not-allowed;
        }

        @keyframes loginNavyShift {
          0% { background-position: 0% 50%; filter: hue-rotate(0deg); }
          100% { background-position: 100% 50%; filter: hue-rotate(8deg); }
        }

        @keyframes loginCardIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="login-shell surface w-full max-w-5xl overflow-hidden rounded-[2rem] border shadow-2xl">
        <div className="grid lg:min-h-[660px] lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="hidden border-r border-white/10 bg-white/[0.035] p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">
            <div>
              <div className="inline-flex rounded-[1.35rem] border border-white/20 bg-white p-3 shadow-soft">
                <img src={logo} alt="Call-a-Technician" className="h-14 w-auto rounded-2xl" />
              </div>
              <div className="mt-10 max-w-sm">
                <span className="badge badge-sky">Secure staff access</span>
                <h2 className="mt-5 text-4xl font-extrabold leading-[1.05] text-white">
                  Operations portal
                </h2>
                <div className="mt-4 h-px w-28 bg-brand-teal/70" />
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Call-a-Technician staff can sign in with an administrator-created
                  account to manage jobs, invoices, technicians, and field work.
                </p>
              </div>

              <div className="mt-10 grid gap-3">
                <div className="login-info-card surface rounded-2xl border-white/10 bg-white/[0.04] px-5 py-5 shadow-none">
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand-sky">
                    Admin workspace
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    Jobs, invoices, reports, and team management
                  </div>
                </div>
                <div className="login-info-card surface rounded-2xl border-white/10 bg-white/[0.04] px-5 py-5 shadow-none">
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand-teal">
                    Technician workspace
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    Assigned work, notes, and job completion tools
                  </div>
                </div>
              </div>
            </div>

            <div className="login-info-card surface rounded-2xl border-brand-sky/20 bg-brand-blue/10 p-5 shadow-none">
              <div className="text-xs font-semibold uppercase tracking-wide text-brand-sky">
                Account access
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Accounts are created by an administrator.
              </p>
            </div>
          </aside>

          <main className="flex items-center justify-center bg-brand-bg p-5 sm:p-8 lg:p-10">
            <div className="w-full max-w-md">
              <div className="mb-7 text-center lg:text-left">
                <div className="mx-auto mb-5 inline-flex rounded-[1.35rem] border border-white/20 bg-white p-3 shadow-soft lg:hidden">
                  <img src={logo} alt="Call-a-Technician" className="h-12 w-auto rounded-2xl sm:h-14" />
                </div>
                <div>
                  <span className="badge badge-blue mb-4">Admin and technician login</span>
                </div>
                <h1 className="text-[2.2rem] font-extrabold leading-[1.05] tracking-normal text-white sm:text-[2.55rem]">
                  Welcome back
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Sign in to continue to the right workspace for your account.
                </p>
              </div>

              <form onSubmit={onSubmit} className="login-form-card surface rounded-[1.5rem] border-brand-sky/20 bg-white/[0.035] p-5 sm:p-6">
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-slate-200" htmlFor="login-email">
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      className="login-input input mt-2 bg-brand-bg/50"
                      value={email}
                      onChange={e=>setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-200" htmlFor="login-password">
                      Password
                    </label>
                    <div className="relative mt-2">
                      <input
                        id="login-password"
                        type={showPwd ? 'text' : 'password'}
                        className="login-input input bg-brand-bg/50 pr-24"
                        value={pwd}
                        onChange={e=>setPwd(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-ghost absolute right-1.5 top-1/2 h-9 min-h-0 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-semibold text-brand-sky shadow-none"
                        onClick={()=>setShowPwd(s=>!s)}
                        aria-pressed={showPwd}
                        aria-label={showPwd ? 'Hide password' : 'Show password'}
                      >
                        {showPwd ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-3 text-sm font-medium text-slate-300">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={e=>setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-transparent accent-brand-teal"
                      />
                      Remember me
                    </label>
                  </div>

                  {msg && (
                    <div
                      className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm font-medium leading-6 text-rose-100 shadow-sm"
                      role="alert"
                    >
                      <div className="text-xs font-semibold uppercase tracking-wide text-rose-200">
                        Sign in failed
                      </div>
                      <p className="mt-1">{msg}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="login-primary btn w-full rounded-full text-base font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && (
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/25 border-t-slate-950"
                        aria-hidden="true"
                      />
                    )}
                    {loading ? 'Logging in...' : 'Log in'}
                  </button>

                  <p className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm italic leading-6 text-slate-300">
                    <span aria-hidden="true" className="mt-0.5 text-brand-sky">ℹ️</span>
                    <span>Accounts are created by an administrator.</span>
                  </p>
                </div>
              </form>

              <p className="mt-5 text-center text-xs leading-5 text-slate-400 lg:text-left">
                This private portal is for authorized Call-a-Technician staff only.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
