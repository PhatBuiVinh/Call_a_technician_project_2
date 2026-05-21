import Section from "../../layout/Section";

export default function CTABand() {
  return (
    <Section muted>
      <div className="container-app">
        <div className="rounded-2xl overflow-hidden bg-brand-navy text-white p-8 md:p-10 relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue to-brand-lightblue" />
          <h3 className="text-2xl font-semibold italic text-white">Need help today?</h3>
          <p className="mt-2 text-white/80">
            Available 24/7, every day. Book now — we’ll come to you.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="/contact" className="rounded-md bg-brand-green text-brand-navy px-6 py-2.5 font-semibold hover:bg-white transition">
              Book Now
            </a>
            <a href="tel:1300551350" className="rounded-md border border-white text-white px-6 py-2.5 font-semibold hover:bg-white/10 transition">
              Call 1300 551 350
            </a>
            <a href="/service-areas" className="rounded-md border border-white/50 text-white/80 px-6 py-2.5 font-semibold hover:bg-white/10 transition">
              Service Areas
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
