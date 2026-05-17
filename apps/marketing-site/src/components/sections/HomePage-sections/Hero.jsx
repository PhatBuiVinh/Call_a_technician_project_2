import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock3, ShieldCheck, MapPin, Phone, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../atoms/Button";

import img1 from "../../../assets/home/Slide1.png";
import img2 from "../../../assets/home/Slide2.png";
import img3 from "../../../assets/home/Slide3.png";
import img4 from "../../../assets/home/Slide4.png";

const SLIDES = [
  {
    src: img1,
    badge: "Need Help Today? We Come To You",
    headline: "Computer down?\nWe're there today.",
    desc: "Don't wait days. Get a local Adelaide technician onsite — same day, no jargon, no fix no fee. Call now or book online in seconds.",
  },
  {
    src: img2,
    badge: "Wi-Fi & Networking",
    headline: "Slow internet?\nWe'll fix it today.",
    desc: "Router setup, Wi-Fi extenders, home and office networks — sorted the same day by a local Adelaide expert.",
  },
  {
    src: img3,
    badge: "Rated 4.6 / 5",
    headline: "Adelaide's most\ntrusted technician.",
    desc: "Trusted by families and businesses across 420+ Adelaide suburbs for fast, honest, onsite support.",
  },
  {
    src: img4,
    badge: "Business IT Support",
    headline: "Stress-free IT\nfor your business.",
    desc: "Device rollouts, network setup, virus protection — we handle your IT so you can focus on what matters.",
  },
];

/* gradient colours used for the blend overlay — must match the section background */
const BG_START = "#1A58D3";
const BG_END = "#000154";

const SLIDE_DURATION = 15000;

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const prev = () => setCurrent((p) => (p - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((p) => (p + 1) % SLIDES.length);
  const slide = SLIDES[current];

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setCurrent((p) => (p + 1) % SLIDES.length), SLIDE_DURATION);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${BG_START} 0%, #0d3cb5 45%, ${BG_END} 100%)`,
      }}
    >
      {/* Subtle radial green accent — brand identity hint */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 18% 60%, rgba(49,238,136,0.08), transparent)",
        }}
      />
      {/* Dot grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ─── MAIN TWO-COLUMN AREA ─── */}
      <div className="relative flex flex-col lg:flex-row min-h-[580px] lg:min-h-[640px]">

        {/* LEFT — text panel */}
        <div
          className="relative z-10 flex items-center lg:w-[52%] shrink-0 py-14 px-6 md:px-10"
          style={{
            paddingLeft: "max(1.5rem, calc((100vw - 1280px) / 2 + 1.5rem))",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              className="max-w-[430px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.38 }}
            >
              <span className="inline-block rounded-full bg-brand-green text-brand-navy text-xs font-bold px-4 py-1.5 mb-5 shadow-sm">
                {slide.badge}
              </span>

              <h1 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white leading-tight whitespace-pre-line">
                {slide.headline}
              </h1>

              <p className="mt-4 text-white/75 text-base md:text-lg leading-relaxed">
                {slide.desc}
              </p>

              <div className="mt-7">
                <Button variant="primary" to="/contact" className="px-7 py-3 text-base">
                  Book a Technician
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-brand-green" /> 24/7 every day
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-brand-green" /> 420+ suburbs
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-brand-green" /> No Fix, No Fee
                </span>
              </div>

              {/* Slide dots */}
              <div className="mt-8 flex items-center gap-3">
                <button
                  onClick={() => { setPaused(true); prev(); }}
                  aria-label="Previous slide"
                  className="w-8 h-8 rounded-full border border-white/30 text-white/70 flex items-center justify-center hover:border-brand-green hover:text-brand-green transition text-lg leading-none"
                >
                  ‹
                </button>
                <div className="flex gap-2">
                  {SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setPaused(true); setCurrent(i); }}
                      aria-label={`Slide ${i + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === current
                          ? "bg-brand-green w-7"
                          : "bg-white/30 w-2 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => { setPaused(true); next(); }}
                  aria-label="Next slide"
                  className="w-8 h-8 rounded-full border border-white/30 text-white/70 flex items-center justify-center hover:border-brand-green hover:text-brand-green transition text-lg leading-none"
                >
                  ›
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT — image with blended edges (desktop only) */}
        <div className="hidden lg:block relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={slide.src}
              alt={slide.headline.replace("\n", " ")}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.48 }}
            />
          </AnimatePresence>

          {/* Gradient blend — left edge (image → background) */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-40 lg:w-56 pointer-events-none z-10"
            style={{
              background: `linear-gradient(to right, #0d3cb5, transparent)`,
            }}
          />
          {/* Gradient blend — top edge */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-20 pointer-events-none z-10"
            style={{
              background: `linear-gradient(to bottom, ${BG_START}, transparent)`,
            }}
          />
          {/* Gradient blend — bottom edge */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-24 pointer-events-none z-10"
            style={{
              background: `linear-gradient(to top, ${BG_END}, transparent)`,
            }}
          />
        </div>
      </div>

      {/* ─── BOTTOM ACTION BAR ─── */}
      <div
        className="relative z-10 border-t"
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        <div
          className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-center gap-3 py-4"
        >
          <a
            href="tel:1300551350"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 text-white px-6 py-2.5 text-sm font-semibold hover:bg-brand-green hover:text-brand-navy hover:border-brand-green transition"
          >
            <Phone className="h-4 w-4" /> 1300 551 350
          </a>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-brand-green text-brand-navy px-6 py-2.5 text-sm font-semibold hover:bg-white transition"
          >
            <Calendar className="h-4 w-4" /> Book a Technician
          </Link>
          <Link
            to="/service-areas"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 text-white/80 px-6 py-2.5 text-sm font-semibold hover:border-white hover:text-white transition"
          >
            <MapPin className="h-4 w-4" /> Service Areas
          </Link>
        </div>
      </div>
    </section>
  );
}
