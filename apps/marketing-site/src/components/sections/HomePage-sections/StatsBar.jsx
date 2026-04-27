import CountUp from "react-countup";
import { motion } from "framer-motion";

const ITEM = ({ value, suffix = "", label }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
    className="px-6 py-6 text-center"
  >
    <div className="text-3xl md:text-4xl font-bold leading-none text-white">
      <CountUp end={value} duration={1.6} separator="," />
      {suffix}
    </div>
    <div className="mt-1 text-sm text-white/80">{label}</div>
  </motion.div>
);

export default function StatsBar() {
  return (
    <section className="section bg-brand-navy text-white">
      <div className="container-app">
        <div className="grid w-full items-center divide-y divide-white/15 overflow-hidden rounded-[32px] border border-white/15 bg-white/[0.03] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <ITEM value={5000} suffix="+" label="Devices fixed" />
          <ITEM value={98} suffix="%" label="Same-day jobs completed" />
          <ITEM value={1200} suffix="+" label="Happy customers in SA" />
        </div>
      </div>
    </section>
  );
}
