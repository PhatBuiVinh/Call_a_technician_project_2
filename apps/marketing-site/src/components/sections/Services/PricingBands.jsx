import Section from "../../layout/Section";
import { CheckCircle2, Clock, Star, Zap } from "lucide-react";
import Button from "../../atoms/Button";
import { Link } from "react-router-dom";

const INCLUDED = [
  "Onsite visit — we come to you",
  "Full diagnosis included in service fee",
  "Same-day pricing regardless of day, night, weekend or public holiday",
  "No Fix, No Fee guarantee",
  "Data stays with you — no device handover",
  "Plain English explanation — no jargon, ever",
  "Written aftercare summary provided",
  "Parts quote approved by you before ordering",
  "20+ years of certified IT experience on every visit",
  "Work done in front of you — full transparency, always",
  "Confirmed appointment window — no vague all-day wait",
  "No cold calls, no upselling, no pressure after the visit",
];

const VALUE_POINTS = [
  { icon: Clock, label: "Same-day availability", sub: "24/7 including weekends & public holidays" },
  { icon: Star, label: "No hidden extras", sub: "One clear hourly rate — nothing added at the door" },
  { icon: Zap, label: "Fast response", sub: "Most jobs completed in a single visit" },
];

export default function PricingBands() {
  return (
    <Section id="pricing">
      <div id="pricing" className="container-app">
        <h2 className="text-center text-2xl font-semibold text-brand-navy">Simple, transparent pricing</h2>
        <p className="mt-2 text-center text-slate-600 max-w-xl mx-auto">
          One clear hourly rate. No hidden fees. If we can't fix it, you don't pay.
        </p>

        {/* Value points strip */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {VALUE_POINTS.map((v) => (
            <div key={v.label} className="flex items-start gap-3 rounded-xl border bg-white p-4 shadow-sm">
              <div className="shrink-0 w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                <v.icon className="h-4 w-4 text-brand-blue" />
              </div>
              <div>
                <div className="text-sm font-semibold text-brand-navy">{v.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{v.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 max-w-2xl mx-auto">
          <div className="rounded-2xl border-2 border-brand-blue bg-white p-8 md:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="text-sm font-medium text-brand-blue uppercase tracking-wide">Standard Service Rate</div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-5xl font-bold text-brand-navy">$165</span>
                  <span className="text-slate-500 mb-1">per hour</span>
                </div>
                <p className="mt-2 text-slate-600 text-sm">
                  One clear hourly rate covering all standard onsite repairs and support.
                </p>
              </div>

              <div className="shrink-0">
                <Button to="/contact" variant="primary" className="px-8 py-3 text-base">
                  Book Now
                </Button>
              </div>
            </div>

            <div className="mt-8 border-t pt-6">
              <div className="text-sm font-semibold text-brand-navy mb-4">What's included — every visit</div>
              <ul className="grid sm:grid-cols-2 gap-3">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-brand-green mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 rounded-xl bg-brand-lightblue/10 border border-brand-lightblue/30 p-4 text-sm text-slate-700">
              <strong className="text-brand-navy">Need a custom quote?</strong> For large business projects, hardware replacement, or data recovery jobs, we provide a free estimate before any work begins.{" "}
              <a href="/contact" className="text-brand-blue underline hover:text-brand-navy">Contact us →</a>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              <Link to="/terms" className="font-medium text-slate-500 underline hover:text-brand-blue">* No Fix, No Fee</Link>. Parts costs and specialist equipment are quoted separately before commencement.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
