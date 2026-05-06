import Button from "../atoms/Button";
import { motion } from "framer-motion";

export default function NeedHelpBand({
  title = "Need help today?",
  description = "Contact us for same-day help — we’ll get you back on track quickly.",
  primaryLabel = "Contact Us",
  primaryTo = "/contact",
  primaryHref,
  secondaryLabel = "Call 1300 551 350",
  secondaryTo,
  secondaryHref = "tel:1300551350",
  className = "",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`rounded-2xl overflow-hidden bg-brand-navy text-white p-8 md:p-10 relative ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green" />
      <div className="absolute -top-20 -right-14 w-44 h-44 rounded-full bg-brand-lightblue/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-10 w-36 h-36 rounded-full bg-brand-green/20 blur-3xl" />

      <div className="relative z-10">
        <h3 className="text-2xl font-semibold italic text-white">{title}</h3>
        <p className="mt-2 text-white/80">{description}</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button to={primaryTo} href={primaryHref} variant="primary">
            {primaryLabel}
          </Button>
          <Button
            to={secondaryTo}
            href={secondaryHref}
            variant="ghost"
            className="border border-white/70 text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/70"
          >
            {secondaryLabel}
          </Button>
        </div>
        <div className="mt-4 text-xs text-white/65">Fast response. Clear pricing. Trusted local support.</div>
      </div>
    </motion.div>
  );
}