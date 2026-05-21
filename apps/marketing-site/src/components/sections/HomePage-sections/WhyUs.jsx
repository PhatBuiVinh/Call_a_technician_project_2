import { motion } from "framer-motion";
import { CheckCircle2, XCircle, MinusCircle, Star } from "lucide-react";
import Section from "../../layout/Section";
import { H2 } from "../../UI/Heading";

const FEATURES = [
  "Same-day onsite visits",
  "No Fix, No Fee guarantee",
  "Upfront pricing, no surprises",
  "In-home Wi-Fi & network fixes",
  "Hardware repairs & upgrades",
  "Work done in front of you",
  "Aftercare summary provided",
];

const PROVIDERS = [
  {
    name: "Call-a-Technician",
    highlight: true,
    badge: "Adelaide's Choice",
    values: [
      { icon: "check", text: "Same-day across Adelaide" },
      { icon: "check", text: "If we can't fix it, you don't pay" },
      { icon: "check", text: "Clear quote before we start" },
      { icon: "check", text: "Mesh setup, coverage tests, onsite" },
      { icon: "check", text: "Diagnosis + parts replacement" },
      { icon: "check", text: "Your device never leaves home" },
      { icon: "check", text: "Plain-English summary included" },
    ],
  },
  {
    name: "Big-Box Repair Counter",
    highlight: false,
    badge: null,
    values: [
      { icon: "minus", text: "Usually 2–7 day queue" },
      { icon: "minus", text: "Diagnostics fee applies" },
      { icon: "minus", text: "Variable; add-ons at counter" },
      { icon: "cross", text: "In-store drop-off only" },
      { icon: "check", text: "Often available; needs check-in" },
      { icon: "cross", text: "Device left with store" },
      { icon: "minus", text: "Receipt with brief notes" },
    ],
  },
  {
    name: "Remote-Only Service",
    highlight: false,
    badge: null,
    values: [
      { icon: "check", text: "Immediate (software only)" },
      { icon: "minus", text: "Limited — varies by provider" },
      { icon: "minus", text: "Hourly blocks or subscriptions" },
      { icon: "cross", text: "Physical issues not possible" },
      { icon: "cross", text: "Not applicable" },
      { icon: "check", text: "No device leaves home" },
      { icon: "minus", text: "Email transcript only" },
    ],
  },
];

function CellIcon({ icon }) {
  if (icon === "check")
    return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
  if (icon === "cross")
    return <XCircle className="h-4 w-4 text-red-400 shrink-0" />;
  return <MinusCircle className="h-4 w-4 text-slate-400 shrink-0" />;
}

export default function WhyUs() {
  return (
    <Section muted>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-[3px] bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green rounded-full mx-auto" />
            <H2 className="mt-4">Why Choose Call-a-Technician?</H2>
            <p className="mt-2 text-slate-600 max-w-xl mx-auto">
              See how we stack up against common alternatives.
            </p>
          </div>

          {/* ─── DESKTOP TABLE ─── */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border shadow-sm">
            {/* Header row */}
            <div className="grid border-b" style={{ gridTemplateColumns: "200px 1fr 1fr 1fr" }}>
              <div className="bg-slate-50 p-4 border-r border-slate-200" />
              {PROVIDERS.map((p) => (
                <div
                  key={p.name}
                  className={`p-4 border-r last:border-r-0 ${
                    p.highlight
                      ? "bg-brand-navy text-white"
                      : "bg-white text-brand-navy border-slate-200"
                  }`}
                >
                  {p.badge && (
                    <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-brand-green text-brand-navy rounded-full px-2.5 py-0.5 mb-2">
                      {p.badge}
                    </span>
                  )}
                  <div className={`font-bold text-xs ${p.highlight ? "text-white" : "text-brand-navy"}`}>
                    {p.name}
                  </div>
                  {p.highlight && (
                    <div className="mt-1 flex gap-0.5 items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-brand-green" fill="currentColor" stroke="none" />
                      ))}
                      <span className="text-xs text-white/70 ml-1">4.6/5</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Feature rows — perfectly aligned because each row is its own grid */}
            {FEATURES.map((feature, fi) => (
              <div
                key={feature}
                className={`grid border-b last:border-b-0 ${fi % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}
                style={{ gridTemplateColumns: "200px 1fr 1fr 1fr" }}
              >
                <div className="p-4 border-r border-slate-200 text-sm font-medium text-slate-700 flex items-center">
                  {feature}
                </div>
                {PROVIDERS.map((p, pi) => (
                  <div
                    key={pi}
                    className={`p-4 border-r last:border-r-0 border-slate-100 flex items-start gap-2 ${
                      p.highlight ? "bg-brand-blue/5" : ""
                    }`}
                  >
                    <CellIcon icon={p.values[fi].icon} />
                    <span
                      className={`text-xs leading-snug ${
                        p.highlight && p.values[fi].icon === "check"
                          ? "font-semibold text-brand-navy"
                          : "text-slate-500"
                      }`}
                    >
                      {p.values[fi].text}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* ─── MOBILE CARDS ─── */}
          <div className="lg:hidden grid gap-4">
            {PROVIDERS.filter((p) => p.highlight).map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl overflow-hidden border ${
                  p.highlight
                    ? "border-brand-navy shadow-lg ring-2 ring-brand-navy/30"
                    : "border-slate-200 shadow-sm"
                }`}
              >
                <div className={`p-4 ${p.highlight ? "bg-brand-navy text-white" : "bg-white"}`}>
                  {p.badge && (
                    <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-brand-green text-brand-navy rounded-full px-2.5 py-0.5 mb-2">
                      {p.badge}
                    </span>
                  )}
                  <div className={`font-bold ${p.highlight ? "text-white" : "text-brand-navy"}`}>
                    {p.name}
                  </div>
                  {p.highlight && (
                    <div className="mt-1 flex gap-0.5 items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-brand-green" fill="currentColor" stroke="none" />
                      ))}
                      <span className="text-xs text-white/70 ml-1">4.6/5</span>
                    </div>
                  )}
                </div>
                <div className={p.highlight ? "bg-brand-blue/5" : "bg-white"}>
                  {p.values.map((v, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 px-4 py-3 border-b last:border-0 ${
                        p.highlight ? "border-brand-navy/10" : "border-slate-100"
                      }`}
                    >
                      <CellIcon icon={v.icon} />
                      <div className="min-w-0">
                        <span className="text-xs text-slate-500 block leading-none mb-0.5">{FEATURES[i]}</span>
                        <span
                          className={`text-xs leading-snug ${
                            p.highlight && v.icon === "check"
                              ? "font-semibold text-brand-navy"
                              : "text-slate-500"
                          }`}
                        >
                          {v.text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Credibility strip */}
          <div className="mt-6 rounded-xl bg-brand-green/10 border border-brand-green/30 p-4 text-sm text-slate-700 text-center">
            Rated{" "}
            <span className="font-bold text-brand-navy">4.6/5</span> by Adelaide customers — backed by our{" "}
            <span className="font-semibold text-brand-navy">No Fix, No Fee</span> promise.
          </div>
        </div>
      </motion.div>
    </Section>
  );
}
