import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search } from "lucide-react";
import Section from "../components/layout/Section";
import Button from "../components/atoms/Button";
import { SUBURB_POSTCODES, toSuburbSlug } from "../data/suburbPostcodes";

const ALL_SUBURBS = Object.keys(SUBURB_POSTCODES).sort();

export default function ServiceAreas() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_SUBURBS;
    return ALL_SUBURBS.filter((s) => s.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="text-slate-800">
      {/* Hero */}
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
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-blue/25 bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-navy mb-4">
                <MapPin className="h-3.5 w-3.5" />
                Adelaide-wide coverage
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
                Computer Repair &amp; IT Support<br className="hidden md:block" /> Across Adelaide
              </h1>
              <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">
                We come to you — same-day onsite support for homes and businesses across
                420+ Adelaide suburbs. No Fix, No Fee.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="primary" to="/contact">Book Now</Button>
                <a
                  href="tel:1300551350"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-brand-blue/50 bg-transparent text-brand-blue px-6 py-2.5 font-semibold hover:bg-brand-blue/10 active:bg-brand-blue/20 hover:-translate-y-0.5 transition-all duration-200 text-sm"
                >
                  Call 1300 551 350
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <Section className="bg-white border-b">
        <div className="container-app grid grid-cols-3 gap-4 text-center">
          {[
            { value: "420+", label: "Suburbs covered" },
            { value: "24/7", label: "Every day, all year" },
            { value: "No Fix, No Fee", label: "Guaranteed" },
          ].map((s) => (
            <div key={s.label} className="py-2">
              <div className="text-xl md:text-2xl font-bold text-brand-navy">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Search + grid */}
      <Section>
        <div className="container-app">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-brand-navy">Find your suburb</h2>
            <p className="mt-2 text-slate-600">
              Click your suburb to see local IT support options and pricing.
            </p>
          </div>

          {/* Search box */}
          <div className="max-w-md mx-auto mb-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search suburbs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Result count */}
          <p className="text-center text-xs text-slate-500 mb-6">
            {filtered.length === ALL_SUBURBS.length
              ? `Showing all ${ALL_SUBURBS.length} suburbs`
              : `${filtered.length} suburb${filtered.length === 1 ? "" : "s"} found`}
          </p>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {filtered.map((suburb) => (
                <Link
                  key={suburb}
                  to={`/computer-repairs/${toSuburbSlug(suburb)}`}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 text-center hover:border-brand-blue hover:text-brand-blue hover:shadow-sm transition group"
                >
                  <span className="group-hover:underline underline-offset-2">{suburb}</span>
                  <div className="text-slate-400 text-[10px] mt-0.5">{SUBURB_POSTCODES[suburb]}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <MapPin className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="font-medium">No suburbs found for "{query}"</p>
              <p className="text-sm mt-1">Try a different spelling, or contact us directly.</p>
              <Button to="/contact" variant="primary" className="mt-4">Request a Technician</Button>
            </div>
          )}
        </div>
      </Section>

      {/* CTA band */}
      <Section>
        <div className="container-app">
          <div className="rounded-2xl overflow-hidden bg-brand-navy text-white p-8 md:p-10 relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue to-brand-lightblue" />
            <h3 className="text-2xl font-semibold italic text-white">Don't see your suburb?</h3>
            <p className="mt-2 text-white/80 max-w-xl">
              We may still be able to help. Call us or send an enquiry — we cover a wide area
              around Adelaide and are always happy to discuss your situation.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button variant="primary" to="/contact">Book Now</Button>
              <a
                href="tel:1300551350"
                className="rounded-md border border-white/40 text-white px-6 py-2.5 font-semibold hover:bg-white/10 transition text-sm inline-flex items-center gap-2"
              >
                Call 1300 551 350
              </a>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
