import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../../assets/logo/Transparent-01.png";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'http://localhost:5173'; // Admin portal URL
  
  // Only show login button if portal URL is configured
  const showLoginButton = !!PORTAL_URL;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Our Services", path: "/services" },
    { name: "Location", path: "/location" },
    { name: "Blog", path: "/blog" },
  ];

  const linkBase = "transition";
  const linkActive = "text-brand4 font-semibold";
  const linkIdle = "text-white hover:text-brand2";

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-brand-navy text-brand-green shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 ml-[-28px]">
          <img src={logo} alt="Call-a-Technician logo" className="h-14 w-auto" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-6">
          {navLinks.map((l) => (
            <NavLink
              key={l.name}
              to={l.path}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
              end={l.path === "/"}
            >
              {l.name}
            </NavLink>
          ))}
        </div>

        {/* Desktop CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/contact" className="btn-primary">Contact Us</Link>

          {/* LOGIN → external Portal - only show if configured */}
          {showLoginButton ? (
            <a
              href={`${PORTAL_URL}/login`}
              className="btn-secondary"
              rel="noreferrer"
            >
              Login
            </a>
          ) : (
            <span className="btn-secondary opacity-60 cursor-not-allowed" title="Portal available on request">
              Portal
            </span>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-brand4 hover:text-brand2 transition"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white text-black absolute top-full left-0 w-full shadow-lg">
          <div className="flex flex-col gap-4 p-4">
            {navLinks.map((l) => (
              <NavLink
                key={l.name}
                to={l.path}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkIdle}`
                }
                end={l.path === "/"}
                onClick={() => setIsOpen(false)}
              >
                {l.name}
              </NavLink>
            ))}
            <Link
              to="/contact"
              className="btn-primary text-center"
              onClick={() => setIsOpen(false)}
            >
              Contact Us
            </Link>

            {/* LOGIN (mobile) → external Portal - only show if configured */}
            {showLoginButton ? (
              <a
                href={`${PORTAL_URL}/login`}
                className="btn-secondary text-center"
                onClick={() => setIsOpen(false)}
                rel="noreferrer"
              >
                Login
              </a>
            ) : (
              <span 
                className="btn-secondary text-center opacity-60 cursor-not-allowed"
                onClick={() => setIsOpen(false)}
                title="Portal available on request"
              >
                Portal
              </span>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
