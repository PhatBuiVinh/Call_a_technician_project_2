import Section from "../../layout/Section";

export default function BlogHero() {
  return (
    <Section className="relative overflow-hidden bg-gradient-to-br from-brand-blue/10 to-brand-lightblue/10">
      <div className="container-app relative z-10">
        <div className="w-16 h-[3px] bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green rounded-full" />
        <h1 className="mt-4 text-4xl md:text-6xl font-semibold italic leading-[1.00] text-brand-navy">Insights & How-Tos</h1>
        <p className="mt-2 text-slate-600 max-w-2xl">
          Practical guides, troubleshooting tips and security advice from our technicians—written for humans.
        </p>
      </div>

      {/* decorative dots */}
      <div className="absolute inset-0 bg-dot-grid text-brand-navy/20 mask-fade-b" />
    </Section>
  );
}
