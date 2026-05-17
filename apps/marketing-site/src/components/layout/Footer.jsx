import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Youtube } from "lucide-react";
import logo2 from "../../assets/logo/Transparent-09.png";
import aboriginalFlag from "../../assets/Australian_Aboriginal_Flag.png";
import tsiFlag from "../../assets/Flag_of_the_Torres_Strait_Islanders.png";

export default function Footer() {
  const socialLinks = [
    { id: 'twitter', href: import.meta.env.VITE_SOCIAL_TWITTER || '', icon: Twitter },
    { id: 'facebook', href: import.meta.env.VITE_SOCIAL_FACEBOOK || '', icon: Facebook },
    { id: 'linkedin', href: import.meta.env.VITE_SOCIAL_LINKEDIN || '', icon: Linkedin },
    { id: 'youtube', href: import.meta.env.VITE_SOCIAL_YOUTUBE || '', icon: Youtube },
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="relative mt-16 border-t border-white/10 bg-brand-navy text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-lightblue/60 to-transparent" />

      <div className="container-app grid grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center gap-2 shrink-0 leading-none">
            <img src={logo2} alt="Call-a-Technician logo" className="block h-16 w-auto object-contain" />
          </Link>
          <p className="mt-4 max-w-sm text-sm text-white/80 leading-relaxed">
            Same-day support for homes and businesses across Adelaide with clear pricing, trusted technicians, and practical fixes.
          </p>
          <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white">Hours (ACST)</h3>
            <div className="mt-3 space-y-1.5 text-sm text-white/80">
              <p><span className="font-medium text-white">Mon-Fri:</span> 8am - 7pm</p>
              <p><span className="font-medium text-white">Sat:</span> 10am - 5pm</p>
              <p><span className="font-medium text-white">Sun:</span> 10am - 5pm</p>
              <p><span className="font-medium text-white">Holidays:</span> 10am - 5pm</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16px] text-white">Company</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link to="/about" className="link-animated-dark text-white/80 hover:text-brand-green">About</Link></li>
            <li><Link to="/services" className="link-animated-dark text-white/80 hover:text-brand-green">Services</Link></li>
            <li><Link to="/consulting" className="link-animated-dark text-white/80 hover:text-brand-green">Consulting</Link></li>
            <li><Link to="/service-areas" className="link-animated-dark text-white/80 hover:text-brand-green">Service Areas</Link></li>
            <li><Link to="/location" className="link-animated-dark text-white/80 hover:text-brand-green">Location Map</Link></li>
            <li><Link to="/blog" className="link-animated-dark text-white/80 hover:text-brand-green">Blog</Link></li>
            <li><Link to="/contact" className="link-animated-dark text-white/80 hover:text-brand-green">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16px] text-white">Services</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link to="/services" className="link-animated-dark text-white/80 hover:text-brand-green">Computer Repairs</Link></li>
            <li><Link to="/services" className="link-animated-dark text-white/80 hover:text-brand-green">Laptop Repairs</Link></li>
            <li><Link to="/services" className="link-animated-dark text-white/80 hover:text-brand-green">Mac Support</Link></li>
            <li><Link to="/services" className="link-animated-dark text-white/80 hover:text-brand-green">Business IT Support</Link></li>
            <li><Link to="/contact" className="link-animated-dark text-white/80 hover:text-brand-green">Book a Technician</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16px] text-white">Trust</h3>
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <p className="text-3xl font-semibold leading-none text-brand-green">4.6/5</p>
            <p className="mt-1 text-xs text-white/70">based on 300,000+ ratings</p>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <img src={aboriginalFlag} alt="Aboriginal Flag" className="h-6 w-auto" />
            <img src={tsiFlag} alt="Torres Strait Islander Flag" className="h-6 w-auto" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-app py-8">
          <h3 className="text-base font-semibold text-white">Acknowledgement of Country</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/75">
            Call-a-Technician acknowledges Aboriginal and Torres Strait Islander people as the Traditional Custodians of the land and pays respect to their Elders, past and present.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-app flex flex-col gap-4 py-6 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Call-a-Technician. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/privacy-policy" className="link-animated-dark text-white/70 hover:text-brand-green">Privacy Policy</Link>
            <Link to="/terms" className="link-animated-dark text-white/70 hover:text-brand-green">Terms</Link>
            {socialLinks.length > 0 ? socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.id} href={item.href} target="_blank" rel="noreferrer" aria-label={item.id} className="link-animated-dark text-white/70 hover:text-brand-green">
                  <Icon className="h-5 w-5" />
                </a>
              );
            }) : <span className="text-xs text-white/55">Social links coming soon</span>}
          </div>
        </div>
      </div>
    </footer>
  );
}
