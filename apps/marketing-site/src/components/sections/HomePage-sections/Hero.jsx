import { motion } from "framer-motion";
import Button from "../../atoms/Button";
import heroImg from "../../../assets/hero-team.jpg";

export default function Hero({ imageUrl }) {
  return (
    <section className="section relative overflow-hidden bg-gradient-to-br from-brand-blue/10 to-brand-lightblue/10">
      {/* Subtle geometric dot pattern */}
      <div className="absolute inset-0 z-0 bg-dot-grid text-brand-navy/20 mask-fade-b" />

      {/* Decorative blobs */}
      <div className="absolute -top-16 -left-16 w-72 h-72 bg-brand-green/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-lightblue/20 rounded-full blur-3xl" />

      {/* Content */}
      <div className="container-app grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left: Copy */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="text-3xl md:text-5xl font-semibold italic text-brand-navy leading-tight">
            Fast, friendly tech support — same day in Adelaide
          </h1>
          <motion.p
            className="mt-4 text-slate-600"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            We fix computers, Wi-Fi, backups, and more — at your home or office.
            No fix, no fee.
          </motion.p>

          <motion.div
            className="mt-6 flex gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
          >
            <Button variant="primary" to="/contact">Book a Technician</Button>
            <Button variant="secondary" href="tel:1300551350">1300 551 350</Button>
          </motion.div>

          <motion.p
            className="mt-2 text-xs text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.28 }}
          >
            Open 7 days · Adelaide & nearby suburbs
          </motion.p>
        </motion.div>

        {/* Right: Photo */}
        <motion.div
          className="rounded-xl overflow-hidden shadow-lg md:h-[380px] h-[240px] flex items-center"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
        >
          {imageUrl ? (
            <img
              src={heroImg}
              alt="Our technician team at work"
              className="aspect-video w-full h-full object-cover"
            />
          ) : (
            <div className="aspect-video w-full h-full grid place-items-center bg-white text-slate-500">
              Hero Illustration / Photo
            </div>
          )}
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
