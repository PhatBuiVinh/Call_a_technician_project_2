import { Phone, MapPin, CheckCircle2 } from "lucide-react";
import Button from "../../atoms/Button";

export default function ServicesHero() {
  return (
    <section className="bg-white px-4 md:px-8 py-6 md:py-8">
      <div className="max-w-7xl mx-auto">
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ background: "linear-gradient(135deg, #EBF3FF 0%, #D0E4FF 45%, #EBF3FF 100%)" }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: "radial-gradient(circle, rgba(26,88,211,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
          <div className="relative z-10 px-6 md:px-12 py-14 md:py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-blue/25 bg-brand-blue/10 text-brand-navy text-xs font-semibold px-4 py-1.5 mb-5">
              <MapPin className="h-3.5 w-3.5" /> Adelaide's on-site IT experts
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
              On-Site Computer Repair<br className="hidden md:block" /> &amp; IT Support
            </h1>
            <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Certified technicians at your door — same day. Clear pricing, no jargon, and a No Fix, No Fee guarantee on every single job.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 justify-center">
              <Button variant="primary" to="/contact" className="px-7 py-3 text-base">
                Book a Technician
              </Button>
              <a
                href="tel:1300551350"
                className="inline-flex items-center gap-2 rounded-md border border-brand-blue/50 bg-transparent text-brand-blue px-7 py-3 font-semibold hover:bg-brand-blue/10 active:bg-brand-blue/20 hover:-translate-y-0.5 transition-all duration-200 text-sm"
              >
                <Phone className="h-4 w-4" /> Call 1300 551 350
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-5 justify-center text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand-blue" /> 420+ suburbs covered</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-brand-blue" /> No Fix, No Fee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
