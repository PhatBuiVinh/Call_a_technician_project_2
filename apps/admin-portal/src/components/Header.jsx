import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const name = user?.name || user?.email?.split('@')[0] || 'Admin';

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-brand-bg/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Brand logo (served from /public) */}
          <Link to="/app" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Call-a-Technician"
              className="h-8 w-auto rounded-sm"
            />
            <span className="sr-only">Call-a-Technician</span>
          </Link>

          {/* Primary nav */}
          <nav className="ml-3 hidden sm:flex items-center gap-1 text-sm">
            <NavLink to="/app"           className={({isActive}) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>Dashboard</NavLink>
            <NavLink to="/incoming-jobs" className={({isActive}) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>Incoming Jobs</NavLink>
            <NavLink to="/invoices"      className={({isActive}) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>Invoices</NavLink>
            <NavLink to="/techs"         className={({isActive}) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>Technicians</NavLink>
            <NavLink to="/calendar"      className={({isActive}) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>Calendar</NavLink>
            <NavLink to="/customers"     className={({isActive}) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>Customers</NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-brand-psky/90">Hi, {name}</span>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="btn btn-blue"
            title="Log out"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
