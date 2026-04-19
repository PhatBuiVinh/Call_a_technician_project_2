import Section from "../../layout/Section";
import { H2 } from "../../UI/Heading";
import { Send, PhoneCall, CalendarCheck } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: Send,
    title: "Send your request",
    blurb: "Fill the form or call us with a quick description of the issue.",
  },
  {
    n: "02",
    icon: PhoneCall,
    title: "We confirm fast",
    blurb: "We usually call back within 30–60 minutes during opening hours.",
    note: "Mon–Sun, 8am–6pm Adelaide time",
  },
  {
    n: "03",
    icon: CalendarCheck,
    title: "Same-day visit",
    blurb: "A technician comes to your home or office and gets you back on track.",
    note: "No Fix, No Fee — clear pricing before work begins",
  },
];

export default function ContactNextSteps() {
  return (
    <Section className="relative overflow-hidden">
      {/* subtle brand backdrop */}
      <div className="absolute inset-0 bg-brand-blue/5" />
      <div className="absolute inset-0 bg-dot-grid text-brand-navy/10 pointer-events-none" />

      <div className="container-app relative z-10">
        <H2 className="text-center">What happens next?</H2>
        <p className="mt-2 text-center text-slate-600">
          Simple three-step process — designed to get you help today.
        </p>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-brand-blue text-white font-semibold">
                  {s.n}
                </div>
                <div className="shrink-0 grid place-items-center w-9 h-9 rounded-md bg-brand-lightblue/30 text-brand-blue">
                  <s.icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 font-semibold text-brand-navy">{s.title}</div>
              <p className="mt-1 text-sm text-slate-700">{s.blurb}</p>
              {s.note && (
                <p className="mt-2 text-xs text-slate-500">{s.note}</p>
              )}
            </div>
          ))}
        </div>

        
      </div>
    </Section>
  );
}
