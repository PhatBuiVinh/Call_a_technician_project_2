import { H2 } from "../../UI/Heading";
import { Send, PhoneCall, CalendarCheck } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: Send,
    title: "Send your enquiry",
    blurb: " Tell us what is happening, or call us directly if you need urgent help.",
  },
  {
    n: "02",
    icon: PhoneCall,
    title: "We contact you",
    blurb: "We review your request and get back to you as soon as possible.",
  },
  {
    n: "03",
    icon: CalendarCheck,
    title: "We confirm the next step",
    blurb: "We explain the best support option for your issue and confirm availability.",
    note: "No Fix, No Fee — clear pricing before work begins",
  },
];

export default function ContactNextSteps() {
  return (
    <section className="bg-slate-50 border-t border-slate-200">
      <div className="section container-app">
        <H2 className="text-center">What happens next?</H2>
        <p className="mt-2 text-center text-slate-600">
          A simple three-step process to help you get support quickly.
        </p>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {STEPS.map((s) => (
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
    </section>
  );
}
