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
    <footer className="bg-slate-900 text-gray-200 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Company Links */}
        <div>
          <h3 className="font-semibold mb-3">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-brand-lightblue motion-standard">About</Link></li>
            <li><Link to="/contact" className="hover:text-brand-lightblue motion-standard">Contact</Link></li>
            <li><Link to="/services" className="hover:text-brand-lightblue motion-standard">Services</Link></li>
            <li><Link to="/location" className="hover:text-brand-lightblue motion-standard">Service Areas</Link></li>
            <li><Link to="/blog" className="hover:text-brand-lightblue motion-standard">Blog</Link></li>
          </ul>
        </div>

        {/* Discover */}
        <div>
          <h3 className="font-semibold mb-3">Discover</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/services" className="hover:text-brand-lightblue motion-standard">Pricing</Link></li>
            <li><Link to="/blog" className="hover:text-brand-lightblue motion-standard">Blog</Link></li>
            <li><Link to="/about" className="hover:text-brand-lightblue motion-standard">Why Choose Us?</Link></li>
            <li><Link to="/location" className="hover:text-brand-lightblue motion-standard">Our Coverage</Link></li>
            <li><Link to="/contact" className="hover:text-brand-lightblue motion-standard">FAQs & Support</Link></li>
          </ul>
        </div>

        {/* Popular */}
        <div>
          <h3 className="font-semibold mb-3">Popular</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/services" className="hover:text-brand-lightblue motion-standard">Computer Repairs</Link></li>
            <li><Link to="/services" className="hover:text-brand-lightblue motion-standard">Laptop Repairs</Link></li>
            <li><Link to="/services" className="hover:text-brand-lightblue motion-standard">PC Repairs</Link></li>
            <li><Link to="/services" className="hover:text-brand-lightblue motion-standard">Mac Repairs</Link></li>
            <li><Link to="/services" className="hover:text-brand-lightblue motion-standard">IT Support</Link></li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <h3 className="font-semibold mb-3">Hours (ACST)</h3>
          <p className="text-sm"><b>Mon–Fri:</b> 8am – 7pm</p>
          <p className="text-sm"><b>Sat:</b> 10am – 5pm</p>
          <p className="text-sm"><b>Sun:</b> 10am – 5pm</p>
          <p className="text-sm"><b>Holidays:</b> 10am – 5pm</p>
        </div>

        {/* Customer Rating */}
        <div>
          <h3 className="font-semibold mb-3">Customer Rating</h3>
          <p className="text-2xl font-bold text-brand-green">4.6/5</p>
          <p className="text-xs text-gray-400">based on 300,000+ ratings</p>
        </div>
      </div>

      <div className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-3">
            <img src={aboriginalFlag} alt="Aboriginal Flag" className="h-6 w-auto" />
            <img src={tsiFlag} alt="Torres Strait Islander Flag" className="h-6 w-auto" />
          </div>
          <h3 className="text-lg font-semibold text-white">Acknowledgement of Country</h3>
          <p className="text-sm text-gray-300 mt-2 max-w-3xl leading-relaxed">
            Call-a-Technician acknowledges Aboriginal and Torres Strait Islander people
            as the Traditional Custodians of the land and pays respect to their Elders,
            past and present.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700 mt-6 pt-6 text-sm text-gray-400 max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo2} alt="Call-a-Technician logo" className="h-20 w-auto" />
          </Link>
        </div>
        
        <p>© {new Date().getFullYear()} Call-a-Technician. All rights reserved.</p>
        <div className="flex space-x-4">
          {socialLinks.length > 0 ? socialLinks.map((item) => {
            const Icon = item.icon;
            return (
              <a key={item.id} href={item.href} target="_blank" rel="noreferrer" aria-label={item.id}>
                <Icon className="w-5 h-5 hover:text-brand-lightblue motion-standard" />
              </a>
            );
          }) : <span className="text-xs text-gray-500">Social links coming soon</span>}
        </div>
      </div>
    </footer>
  );
}
