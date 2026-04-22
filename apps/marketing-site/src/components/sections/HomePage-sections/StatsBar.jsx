import CountUp from "react-countup";
import { motion } from "framer-motion";

const ITEM = ({ value, suffix = "", label }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
    className="text-center rounded-xl border border-brand-blue/20 bg-white/80 p-5"
  >
    <div className="text-3xl font-semibold text-brand-navy">
      <CountUp end={value} duration={1.6} separator="," />
      {suffix}
    </div>
    <div className="text-sm text-slate-600 mt-1">{label}</div>
  </motion.div>
);

export default function StatsBar() {
  return (
    <section className="section bg-gradient-to-b from-brand-lightblue/10 to-white">
      <div className="container-app">
        <div className="grid sm:grid-cols-3 gap-6 items-center">
          <ITEM value={5000} suffix="+" label="Devices fixed" />
          <ITEM value={98} suffix="%" label="Same-day jobs completed" />
          <ITEM value={1200} suffix="+" label="Happy customers in SA" />
        </div>
      </div>
    </section>
  );
}
