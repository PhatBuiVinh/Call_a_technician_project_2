import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Button from "../atoms/Button";
import logo from "../../assets/logo/Transparent-01.png";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Our Services", path: "/services" },
    { name: "Location", path: "/location" },
    { name: "Blog", path: "/blog" },
  ];

  const linkBase = "relative transition motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lightblue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:rounded-full after:transition-all after:duration-200";
  const linkActive = "text-brand-green font-semibold after:w-full after:bg-brand-green";
  const linkIdle = "text-white/90 hover:text-brand-lightblue hover:after:w-full hover:after:bg-brand-lightblue";
  const mobileLinkIdle = "text-slate-800 hover:text-brand-blue";

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 text-brand-green border-b border-white/10 backdrop-blur-md motion-standard ${isScrolled ? "bg-brand-navy/95" : "bg-brand-navy/90"}`}>
      <div className="max-w-6xl mx-auto px-4 py-2.5 md:py-3 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Call-a-Technician logo" className="h-12 md:h-14 w-auto" />
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
          <Button to="/contact" variant="primary" className="text-sm">Contact Us</Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-brand-green hover:text-brand-lightblue transition motion-standard"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <>
          <button
            className="fixed inset-0 top-[76px] bg-slate-950/50 backdrop-blur-md md:hidden"
            aria-label="Close menu"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 w-full rounded-b-[32px] border-b border-slate-200 bg-white text-black md:hidden">
            <div className="flex flex-col gap-2 p-4">
              {navLinks.map((l) => (
                <NavLink
                  key={l.name}
                  to={l.path}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2.5 text-base transition motion-standard focus-brand ${isActive ? "bg-brand-lightblue/20 text-brand-blue font-semibold" : mobileLinkIdle}`
                  }
                  end={l.path === "/"}
                  onClick={() => setIsOpen(false)}
                >
                  {l.name}
                </NavLink>
              ))}
              <Button
                to="/contact"
                variant="primary"
                className="mt-1 text-center justify-center"
                onClick={() => setIsOpen(false)}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
