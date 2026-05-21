import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Section from "../../layout/Section";
import { H2 } from "../../UI/Heading";

const REVIEWS = [
  {
    name: "Sandra M.",
    suburb: "Glenelg",
    date: "March 2025",
    rating: 5,
    quote:
      "Mustafa came out the same afternoon I called. Fixed my virus issue, cleaned up the computer and it runs better than when I bought it. Very patient explaining everything to me. Will definitely use again.",
  },
  {
    name: "David T.",
    suburb: "Prospect",
    date: "February 2025",
    rating: 5,
    quote:
      "Our office Wi-Fi had been dropping out for months. Mustafa diagnosed the problem in 20 minutes, replaced the router and set up a proper network. Hasn't dropped out once since. Highly recommend.",
  },
  {
    name: "Karen L.",
    suburb: "Norwood",
    date: "January 2025",
    rating: 5,
    quote:
      "I thought my laptop was dead — wouldn't turn on at all. Call-a-Technician came out that evening, diagnosed a power board fault and had it fixed by the next day. Saved me buying a new one. Really impressed.",
  },
  {
    name: "Peter H.",
    suburb: "Unley",
    date: "December 2024",
    rating: 5,
    quote:
      "Set up my whole new home office — PC, printer, email, everything. Took about 2 hours and I didn't have to do a thing. No jargon, just got it done. Great value.",
  },
  {
    name: "Michelle R.",
    suburb: "Tea Tree Gully",
    date: "November 2024",
    rating: 5,
    quote:
      "My daughter's school laptop got a bad virus and was completely unusable. Mustafa had it cleaned up and back to normal within the hour. Professional, friendly and no call-out fee. Brilliant service.",
  },
  {
    name: "Tony B.",
    suburb: "West Lakes",
    date: "October 2024",
    rating: 4,
    quote:
      "Good honest service. Came on a Saturday morning, recovered the data from my old hard drive and transferred it to my new computer. Straightforward pricing, no hidden costs. Would use again.",
  },
];

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={15}
          className={i < count ? "text-brand-green" : "text-slate-300"}
          fill="currentColor"
          stroke="none"
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx((i) => (i - 1 + REVIEWS.length) % REVIEWS.length);
  const next = () => setIdx((i) => (i + 1) % REVIEWS.length);
  const r = REVIEWS[idx];

  return (
    <Section muted>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-[3px] bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green rounded-full mx-auto" />
          <H2 className="mt-4">What Our Customers Say</H2>
          <p className="mt-2 text-slate-600">Real reviews from Adelaide locals we've helped.</p>
        </div>

        {/* Large featured review */}
        <div className="relative bg-white rounded-2xl shadow-sm border p-8 md:p-10 overflow-hidden">
          {/* Brand accent line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green" />

          <Quote className="absolute top-6 right-8 h-16 w-16 text-brand-lightblue/15" />

          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Stars count={r.rating} />
              <p className="mt-4 text-base md:text-lg text-slate-700 italic leading-relaxed max-w-3xl">
                "{r.quote}"
              </p>
              <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="font-semibold text-brand-navy">{r.name}</div>
                  <div className="text-sm text-slate-500">
                    {r.suburb} · {r.date}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={prev}
              aria-label="Previous review"
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:border-brand-blue hover:text-brand-blue transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {REVIEWS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Review ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === idx ? "bg-brand-blue w-6" : "bg-slate-200 w-2 hover:bg-slate-300"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Next review"
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:border-brand-blue hover:text-brand-blue transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="ml-auto text-xs text-slate-400">
              {idx + 1} / {REVIEWS.length}
            </span>
          </div>
        </div>

      </div>
    </Section>
  );
}
