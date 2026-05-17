import CountUp from "react-countup";

const ITEM = ({ value, suffix = "", label }) => (
  <div className="text-center">
    <div className="text-3xl font-semibold text-brand-navy">
      <CountUp end={value} duration={1.6} separator="," />
      {suffix}
    </div>
    <div className="text-sm text-slate-600 mt-1">{label}</div>
  </div>
);

export default function StatsBar() {
  return (
    <section className="section bg-brand-lightblue/10">
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
