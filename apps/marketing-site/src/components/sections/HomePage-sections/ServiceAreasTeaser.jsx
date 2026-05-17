import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import Section from "../../layout/Section";
import { SUBURB_POSTCODES, toSuburbSlug } from "../../../data/suburbPostcodes";

const FEATURED = Object.entries(SUBURB_POSTCODES).slice(0, 24);

export default function ServiceAreasTeaser() {
  return (
    <Section muted>
      <div className="container-app">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-white px-3 py-1 text-xs font-semibold text-brand-blue mb-3">
            <MapPin className="h-3.5 w-3.5" />
            Adelaide-wide coverage
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-brand-navy">We service all of Adelaide</h2>
          <p className="mt-2 text-slate-600 max-w-xl mx-auto">
            From the CBD to the Hills and southern suburbs — we come to you. Same-day availability across 420+ Adelaide suburbs.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {FEATURED.map(([suburb, postcode]) => (
            <Link
              key={suburb}
              to={`/computer-repairs/${toSuburbSlug(suburb)}`}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-center hover:border-brand-blue hover:shadow-sm transition group"
            >
              <div className="text-xs font-medium text-slate-700 group-hover:text-brand-blue transition">
                {suburb}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{postcode}</div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/service-areas"
            className="inline-flex items-center gap-2 rounded-full bg-brand-navy text-white px-6 py-3 text-sm font-semibold hover:bg-brand-blue transition"
          >
            View all 420+ service areas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Section>
  );
}
