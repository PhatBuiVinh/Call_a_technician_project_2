import { useMemo, useState } from "react";
import { Disclosure } from "@headlessui/react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Section from "../../layout/Section";
import { H2 } from "../../UI/Heading";

const FAQS = [
  { q: "Do you offer same-day service in Adelaide?", a: "Yes. Most appointments can be arranged the same day depending on your location and time of enquiry." },
  { q: "What areas do you cover?", a: "We service Adelaide and surrounding suburbs. If you’re unsure, call 1300 551 350—we often travel further or assist remotely." },
  { q: "How does pricing work?", a: "We provide clear, upfront pricing before work begins. If we can’t fix the issue, you don’t pay (No Fix, No Fee)." },
  { q: "Can you help remotely?", a: "Yes. Many software, email, and configuration issues can be resolved via secure remote support." },
  { q: "What devices do you work with?", a: "Windows and macOS laptops/desktops, Wi-Fi and networking gear, printers, and common peripherals." },
  { q: "How do I book?", a: "Use the ‘Book a Technician’ button or call 1300 551 350. We’ll confirm a convenient time and arrive prepared." },
];

export default function FAQ() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return FAQS;
    return FAQS.filter(
      (item) =>
        item.q.toLowerCase().includes(s) ||
        item.a.toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <Section muted>
      <div className="max-w-5xl mx-auto">
        <H2 className="text-center">Frequently Asked Questions</H2>

        {/* Search */}
        <div className="mt-4 max-w-xl mx-auto grid sm:grid-cols-[1fr_auto] gap-3 items-end">
          <label className="text-sm text-slate-600">
            Search FAQs
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-lightblue/60"
              placeholder="e.g., pricing, remote, suburbs…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <div className="text-sm text-slate-600 justify-self-end">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Two-column accordion grid */}
        <div className="mt-6 grid md:grid-cols-2 gap-5">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-brand-blue/20 via-brand-lightblue/20 to-brand-green/20 p-[1.5px] rounded-xl"
            >
              <div className="rounded-xl bg-white/90 backdrop-blur border shadow-sm">
                <Disclosure>
                  {({ open }) => (
                    <>
                      {/* ✅ Use Disclosure.Button (not a plain button) */}
                      <Disclosure.Button className="w-full p-4 md:p-5 flex items-start gap-3 text-left">
                        <span className="shrink-0 mt-1 inline-flex items-center justify-center w-7 h-7 rounded-md bg-brand-lightblue/25 text-brand-blue">
                          <HelpCircle className="w-4 h-4" />
                        </span>
                        <span className="flex-1 font-semibold text-brand-navy">
                          {item.q}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            open ? "rotate-180 text-brand-blue" : "text-slate-400"
                          }`}
                        />
                      </Disclosure.Button>

                      {/* ✅ Use Disclosure.Panel, animated with Framer Motion */}
                      <AnimatePresence initial={false}>
                        {open && (
                          <Disclosure.Panel
                            as={motion.div}
                            key="panel"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="pt-0 md:pt-1 pb-4 px-4 md:px-5 pl-14 text-sm text-slate-600">
                              {item.a}
                            </div>
                          </Disclosure.Panel>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </Disclosure>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom callout */}
        <div className="mt-6 rounded-xl border bg-brand-lightblue/10 p-4 text-sm text-slate-700 text-center">
          Still have questions?{" "}
          <a className="underline text-brand-blue hover:text-brand-lightblue" href="/contact">
            Contact us
          </a>{" "}
          or call <a className="underline" href="tel:1300551350">1300 551 350</a>.
        </div>
      </div>
    </Section>
  );
}
