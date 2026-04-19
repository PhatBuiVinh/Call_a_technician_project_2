import { motion } from "framer-motion";
import { ShieldCheck, Clock3, Star, ArrowRight } from "lucide-react";
import Button from "../../atoms/Button";
import heroImg from "../../../assets/hero-team.jpg";

export default function Hero({ imageUrl }) {
  const heroSource = imageUrl || heroImg;

  return (
    <section className="section-feature relative overflow-hidden bg-gradient-to-br from-brand-blue/10 via-white to-brand-lightblue/15">
      <div className="absolute inset-0 z-0 bg-dot-grid text-brand-navy/20 mask-fade-b" />

      <div className="absolute -top-16 -left-16 w-72 h-72 bg-brand-green/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-lightblue/20 rounded-full blur-3xl" />

      <div className="container-app grid md:grid-cols-[1.05fr_0.95fr] gap-8 md:gap-10 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-white/80 px-3 py-1 text-xs font-semibold text-brand-blue">
            <Star className="h-3.5 w-3.5 fill-current" />
            Rated 4.9/5 by 1,200+ Adelaide customers
          </div>

          <h1 className="h1 mt-4">
            Same-day tech support that fixes the issue the first time
          </h1>

          <motion.p
            className="mt-4 text-slate-600 text-base md:text-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            Home or office, we handle computers, Wi-Fi, email, and security issues with clear pricing and no confusing jargon.
          </motion.p>

          <motion.div
            className="mt-7 flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
          >
            <Button variant="primary" to="/contact" className="min-w-52 inline-flex items-center justify-center gap-2">
              Book a Technician
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="secondary" href="tel:1300551350" className="min-w-44 justify-center">
              Call 1300 551 350
            </Button>
          </motion.div>

          <motion.div
            className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
          >
            <div className="rounded-lg border border-brand-blue/20 bg-white/80 px-3 py-2 text-xs text-slate-700 inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-brand-blue" />
              Same-day availability
            </div>
            <div className="rounded-lg border border-brand-blue/20 bg-white/80 px-3 py-2 text-xs text-slate-700 inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-blue" />
              No Fix, No Fee
            </div>
            <div className="rounded-lg border border-brand-blue/20 bg-white/80 px-3 py-2 text-xs text-slate-700 inline-flex items-center gap-2">
              <Star className="h-4 w-4 text-brand-blue" />
              Local Adelaide team
            </div>
          </motion.div>

          <motion.p
            className="mt-3 text-xs text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.28 }}
          >
            Open 7 days · Adelaide and nearby suburbs · Fast response during business hours
          </motion.p>
        </motion.div>

        <motion.div
          className="relative rounded-2xl overflow-hidden border border-white/60 shadow-[0_24px_70px_rgba(0,1,84,0.22)] md:h-[430px] h-[270px] flex items-center"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
        >
          <img
            src={heroSource}
            alt="Our technician team at work"
            className="aspect-video w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/45 via-brand-navy/10 to-transparent" />

          <div className="absolute left-4 right-4 bottom-4 rounded-xl bg-white/92 backdrop-blur-md border border-white/80 p-3 sm:p-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xl font-semibold text-brand-navy">5,000+</div>
                <div className="text-[11px] text-slate-600">Devices fixed</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-brand-navy">98%</div>
                <div className="text-[11px] text-slate-600">Same-day jobs</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-brand-navy">4.9</div>
                <div className="text-[11px] text-slate-600">Avg rating</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Curved divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-[60px] md:h-[80px] text-white"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C480,120 960,0 1440,120 L1440,0 L0,0 Z"
            className="fill-white"
          />
        </svg>
      </div>
    </section>
  );
}
