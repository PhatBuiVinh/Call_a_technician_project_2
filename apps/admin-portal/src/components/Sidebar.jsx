import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const linkBase = 'flex items-center gap-3 px-3 py-3 rounded-xl border min-h-[48px] transition text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-sky';
const linkActive = 'bg-brand-blue/20 border-brand-sky/40 text-white shadow-sm';
const linkIdle = 'border-transparent text-slate-300 hover:bg-white/5 hover:border-white/10 hover:text-white';

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.email?.split('@')[0] || 'Technician';

  const LinkItem = ({ to, icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? linkActive : linkIdle}`
      }
      onClick={onClose}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-xs font-semibold text-brand-sky">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </NavLink>
  );

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-dvh w-72 flex-col border-r border-surf bg-[#070a31]/95 p-4 shadow-2xl transition-transform duration-200 ease-out lg:sticky lg:z-10 lg:shadow-none
                   ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="surface rounded-2xl p-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-blue font-bold text-white shadow-sm">
              T
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-extrabold leading-tight">
                Technician Portal
              </div>
              <div className="truncate text-xs text-slate-400">
                Call a Technician
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost h-9 min-h-0 px-3 text-sm lg:hidden"
              aria-label="Close menu"
            >
              Close
            </button>
          </div>
        </div>

        <nav className="mt-5 flex flex-col gap-1" aria-label="Technician navigation">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Work
          </div>
          <LinkItem to="/tech-view" icon="📋" label="My Jobs" />
          <LinkItem to="/tech-view/completed" icon="✓" label="Completed Jobs" />
        </nav>

        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-slate-400">
          View your active jobs and completed history. Closed jobs are managed by admin.
        </div>

        <div className="mt-auto pt-5">
          <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-slate-500">
              Signed in
            </div>
            <div className="truncate text-sm font-medium text-slate-200">
              {displayName}
            </div>
          </div>
          <button onClick={logout} className="btn btn-ghost w-full text-sm">
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
