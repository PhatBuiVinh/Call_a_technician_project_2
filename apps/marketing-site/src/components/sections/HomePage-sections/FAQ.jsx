import { useMemo, useState } from "react";
import { Disclosure } from "@headlessui/react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Section from "../../layout/Section";
import { H2 } from "../../UI/Heading";

const FAQS = [
  {
    q: "Do you offer same-day service in Adelaide?",
    a: "Yes — most appointments can be arranged the same day depending on your location and time of enquiry. Call early for best availability. We're available 7 days a week including weekends and public holidays.",
  },
  {
    q: "What does 'No Fix, No Fee' actually mean?",
    a: "If we attend your home or business and cannot fix the problem, you pay nothing for the service visit. The only exceptions are if you've approved a parts order that we've already sourced, or if you choose not to proceed after we identify the fault. We'll always tell you upfront before any cost is incurred.",
  },
  {
    q: "How does pricing work?",
    a: "We provide a clear, upfront quote before any work begins. Our standard service visit starts from $99 for most common repairs, with specialist jobs quoted individually. There are no hidden call-out fees or surprise charges after the work is done.",
  },
  {
    q: "What areas do you cover?",
    a: "We cover 420+ suburbs across Greater Adelaide including the city, inner suburbs, northern and southern corridors, eastern hills and coastal areas. If you're unsure whether we cover your area, just call 1300 551 350 — we'll confirm quickly.",
  },
  {
    q: "Can you help remotely without visiting?",
    a: "Yes. Many software, email, configuration and security issues can be resolved quickly via secure remote access — without you needing to leave home or hand over your device. We'll let you know during the call whether remote support is the right option for your problem.",
  },
  {
    q: "What devices and brands do you work with?",
    a: "We work with Windows PCs and laptops, macOS computers, Wi-Fi routers and networking gear, printers, and common peripherals. We're experienced with all major brands — Dell, HP, Lenovo, ASUS, Acer, Apple, TP-Link and more.",
  },
  {
    q: "Is my data safe during the repair?",
    a: "Your privacy is important to us. We work on your device in front of you wherever possible, and your computer never leaves your home unless you specifically request it. We'll always recommend a backup before any major repair.",
  },
  {
    q: "How do I book an appointment?",
    a: "You can book via our online contact form, or simply call 1300 551 350. We'll ask a few questions about your issue, confirm your suburb and availability, and give you a time that suits. Most bookings are confirmed within the hour.",
  },
  {
    q: "Do you help small businesses as well as home users?",
    a: "Absolutely. We support small offices, home-based businesses, retail shops, and professional services with onsite IT support, device setup, network installation, and ongoing maintenance. Business visits can be arranged outside normal hours where needed.",
  },
  {
    q: "Do you offer a warranty on repairs?",
    a: "Yes — all work is covered by a 30-day service warranty. If the same issue returns within 30 days of the repair, we'll revisit at no additional charge. This doesn't cover new faults or unrelated issues, but gives you confidence that every fix is done properly the first time.",
  },
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
        <div className="text-center mb-8">
          <div className="w-16 h-[3px] bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green rounded-full mx-auto" />
          <H2 className="mt-4">Frequently Asked Questions</H2>
          <p className="mt-2 text-slate-600">
            Answers to the questions we hear most often.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8 relative">
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
            placeholder="Search questions… e.g. pricing, same-day, remote"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
          {q && (
            <p className="mt-2 text-xs text-slate-500 text-center">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Two-column accordion */}
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="w-full p-4 md:p-5 flex items-start gap-3 text-left group">
                      <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition">
                        <HelpCircle className="w-4 h-4" />
                      </span>
                      <span className="flex-1 font-semibold text-brand-navy text-sm leading-snug">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 mt-0.5 transition-transform ${
                          open ? "rotate-180 text-brand-blue" : "text-slate-400"
                        }`}
                      />
                    </Disclosure.Button>

                    <AnimatePresence initial={false}>
                      {open && (
                        <Disclosure.Panel
                          as={motion.div}
                          key="panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="pb-4 px-4 md:px-5 pl-14 text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
                            {item.a}
                          </div>
                        </Disclosure.Panel>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </Disclosure>
            </div>
          ))}
        </div>

        {/* Bottom callout */}
        <div className="mt-8 rounded-xl border bg-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="font-semibold text-brand-navy text-sm">Still have a question?</div>
            <div className="text-sm text-slate-500 mt-0.5">We're happy to answer before you book.</div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a
              href="/contact"
              className="rounded-lg bg-brand-blue text-white px-4 py-2 text-sm font-semibold hover:bg-brand-navy transition"
            >
              Contact us
            </a>
            <a
              href="tel:1300551350"
              className="rounded-lg border border-brand-blue text-brand-blue px-4 py-2 text-sm font-semibold hover:bg-brand-blue hover:text-white transition"
            >
              1300 551 350
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
