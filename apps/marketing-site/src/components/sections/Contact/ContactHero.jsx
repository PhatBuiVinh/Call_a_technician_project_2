import { Clock, MapPin, CheckCircle2 } from "lucide-react";

export default function ContactHero() {
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
          <div className="relative z-10 px-6 md:px-12 py-12 md:py-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-blue/25 bg-brand-blue/10 text-brand-navy text-xs font-semibold px-4 py-1.5 mb-5">
              <Clock className="h-3.5 w-3.5" /> We reply within the hour
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              Get in touch — we reply fast
            </h1>
            <p className="mt-3 text-slate-600 text-base max-w-xl mx-auto leading-relaxed">
              Same-day support across 420+ Adelaide suburbs. Tell us what's going on and your preferred time — we'll confirm shortly.
            </p>
            <div className="mt-5 flex flex-wrap gap-5 justify-center text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-brand-blue" /> 24/7 every day</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand-blue" /> 420+ suburbs</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-brand-blue" /> No Fix, No Fee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
