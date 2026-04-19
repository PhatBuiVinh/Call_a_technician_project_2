import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthProvider';

export default function Shell({ children, title = 'Technician Portal', subtitle = 'Daily Work Queue' }){
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const { user, logout } = useAuth();

  // close the drawer when route changes
  useEffect(()=>{ setOpen(false); }, [loc.pathname, loc.search]);

  const displayName = user?.name || user?.email?.split('@')[0] || 'Technician';

  return (
    <div className="min-h-screen flex bg-brand-bg text-white">
      <Sidebar open={open} onClose={()=>setOpen(false)} />

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-brand-bg/90 backdrop-blur">
          <div className="container-app h-16 flex items-center gap-3">
            <button className="lg:hidden btn-ghost" onClick={()=>setOpen(true)} aria-label="Open menu">Menu</button>

            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base font-semibold truncate">{title}</h1>
              <p className="text-xs text-slate-400 truncate">{subtitle}</p>
            </div>

            {loc.pathname !== '/tech-view' && (
              <button className="btn-ghost hidden sm:inline-flex" onClick={() => nav('/tech-view')}>
                All Jobs
              </button>
            )}

            <div className="hidden md:flex items-center text-sm text-slate-300">
              {displayName}
            </div>

            <button
              className="btn-ghost"
              onClick={() => {
                logout();
                nav('/');
              }}
            >
              Log out
            </button>
          </div>
        </header>

        <main className="container-app py-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
