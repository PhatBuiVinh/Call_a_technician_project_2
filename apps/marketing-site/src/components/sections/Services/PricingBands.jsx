import Section from "../../layout/Section";

export default function PricingBands() {
  const plans = [
    { name: "Basic Visit", price: "from $99", best: false, features: ["Diagnosis & quick fixes", "Optimise performance", "Advice & next steps"] },
    { name: "Standard Visit", price: "from $169", best: true, features: ["Most on-site jobs", "Wi-Fi troubleshooting", "Backup & security setup"] },
    { name: "Advanced / Quote", price: "request", best: false, features: ["Hardware repairs", "Data recovery attempts", "Small office work"] },
  ];
  return (
    <Section>
      <div className="container-app">
        <h2 className="text-center text-2xl font-semibold text-brand-navy">Transparent pricing</h2>
        <p className="mt-2 text-center text-slate-600">Clear estimates before work begins. No Fix, No Fee.</p>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-2xl border border-slate-200/70 bg-white p-6 transition-transform duration-200 motion-safe:hover:-translate-y-1 ${p.best ? "ring-2 ring-brand-blue" : ""}`}>
              <div className={p.best ? "chip-success inline-flex" : "chip inline-flex"}>{p.name}</div>
              <div className="mt-1 text-2xl font-semibold text-brand-navy">{p.price}</div>
              <ul className="mt-4 text-sm text-slate-700 space-y-1 list-disc list-inside">
                {p.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <a href="/contact" className="mt-5 inline-block rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white focus-brand hover:bg-brand-navy">
                Book / Ask price →
              </a>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
