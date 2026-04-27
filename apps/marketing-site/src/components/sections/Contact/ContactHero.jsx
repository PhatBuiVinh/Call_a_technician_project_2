import Section from "../../layout/Section";

export default function ContactHero() {
  return (
    <Section className="relative overflow-hidden bg-gradient-to-br from-brand-blue/10 to-brand-lightblue/10">
      <div className="absolute inset-0 bg-dot-grid text-brand-navy/15 pointer-events-none" />
      <div className="container-app relative z-10 text-center">
        <div className="w-16 h-[3px] bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green rounded-full mx-auto" />
        <h1 className="mt-4 text-4xl md:text-6xl font-semibold italic leading-[1.00] text-brand-navy">
          Get in touch — we reply fast
        </h1>
        <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
          Same-day support across Adelaide. Tell us what’s going on and your preferred time — we’ll confirm shortly.
        </p>
      </div>
    </Section>
  );
}
