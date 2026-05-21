import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";
import Section from "../../layout/Section";
import Button from "../../atoms/Button";

export default function FAQStrip({ items = [] }) {
  const [open, setOpen] = useState(null);

  return (
    <Section muted>
      <div className="container-app">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-navy">Common questions</h2>
          <p className="mt-2 text-slate-600">Quick answers before you book.</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {items.map((f, idx) => (
            <div
              key={idx}
              className="rounded-xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full flex items-center gap-3 p-4 md:p-5 text-left group"
              >
                <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition">
                  <HelpCircle className="w-4 h-4" />
                </span>
                <span className="flex-1 font-semibold text-brand-navy text-sm">{f.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                    open === idx ? "rotate-180 text-brand-blue" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {open === idx && (
                  <motion.div
                    key="panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pb-4 px-4 md:px-5 pl-16 text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
                      {f.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 max-w-3xl mx-auto rounded-xl bg-white border p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="font-semibold text-brand-navy text-sm">Still unsure?</div>
            <div className="text-sm text-slate-500 mt-0.5">Call us — we'll answer before you commit to anything.</div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button variant="primary" to="/contact" className="text-sm px-4 py-2">Book Now</Button>
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
