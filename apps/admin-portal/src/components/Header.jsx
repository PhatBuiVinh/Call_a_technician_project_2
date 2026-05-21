import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import Logo from './UI/Logo';
import { useAuth } from '../context/AuthProvider';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const name = user?.name || user?.email?.split('@')[0] || 'Admin';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/app', label: 'Dashboard' },
    { to: '/incoming-jobs', label: 'Incoming Jobs' },
    { to: '/invoices', label: 'Invoices' },
    { to: '/techs', label: 'Technicians' },
    { to: '/calendar', label: 'Calendar' },
    { to: '/customers', label: 'Customers' },
    { to: '/reports', label: 'Reports' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-brand-bg/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Brand logo (inline SVG to avoid raster black background and improve scaling) */}
          <Link to="/app" className="flex items-center gap-2 shrink-0 leading-none">
            <Logo className="h-9 w-auto" />
            <span className="sr-only">Call-a-Technician</span>
          </Link>

          {/* Primary nav - desktop */}
          <nav className="ml-3 hidden md:flex items-center gap-1 text-sm">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({isActive}) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="hidden sm:inline text-brand-psky/90">Hi, {name}</span>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="btn btn-blue hidden sm:inline-flex"
            title="Log out"
          >
            Log out
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden btn btn-ghost p-2"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-brand-bg/95 backdrop-blur">
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({isActive}) =>
                  `block px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="border-t border-white/10 pt-3 mt-3">
              <div className="px-3 py-2 text-sm text-slate-400">
                Signed in as <span className="text-slate-200">{name}</span>
              </div>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="w-full text-left px-3 py-3 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
              >
                Log out
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
