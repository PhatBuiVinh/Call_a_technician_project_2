import Section from "../components/layout/Section";
import { H2 } from "../components/ui/Heading";
import Button from "../components/atoms/Button";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function About() {
  return (
    <div className="text-slate-800">
      {/* HERO */}
      <Section className="relative overflow-hidden bg-gradient-to-br from-brand-blue/10 to-brand-lightblue/10">
        <div className="absolute inset-0 bg-dot-grid text-brand-navy/15 pointer-events-none" />
        <div className="container-app text-center relative z-10">
          <div className="w-16 h-[3px] bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green rounded-full mx-auto" />
          <h1 className="mt-4 text-3xl md:text-5xl font-semibold italic text-brand-navy">
            We make tech support simple, human, and fast.
          </h1>
          <p className="mt-3 text-slate-600 text-lg max-w-2xl mx-auto">
            Adelaide-based technicians delivering same-day help for homes and small businesses —
            without jargon, and with a clear promise: <span className="font-medium">No Fix, No Fee.</span>
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" className="px-6 py-3" to="/contact">Book a Technician</Button>
            <Button variant="secondary" className="px-6 py-3" to="/contact">Contact Us</Button>
          </div>
        </div>
      </Section>

      {/* OUR STORY (timeline + image) */}
      <Section>
        <div className="container-app grid md:grid-cols-2 gap-10 items-center">
          {/* Image (replace src later) */}
          <div className="rounded-xl overflow-hidden border bg-white">
            <img
              src="/src/assets/about/team.jpg"
              alt="Our team at work"
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>

          <div>
            <H2>Started in Adelaide, growing with you</H2>
            <p className="mt-3 text-slate-700 leading-relaxed">
              Call-a-Technician began with a simple idea: make reliable, same-day IT help accessible
              to everyone — at home or in the office. Today, we support suburbs across South Australia,
              with the same friendly, human approach.
            </p>

            {/* Timeline */}
            <ul className="relative mt-6">
              <span className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />
              {[
                { year: "2015", text: "Founded in Adelaide — on-site computer help for neighbours and friends." },
                { year: "2018", text: "Expanded coverage across metro SA with same-day availability." },
                { year: "Today", text: "10,000+ jobs completed; 4.9/5 average rating from locals." },
              ].map((t) => (
                <li key={t.year} className="relative pl-10 py-3">
                  <span className="absolute left-2 top-4 inline-block w-3.5 h-3.5 rounded-full bg-brand-blue ring-4 ring-brand-lightblue/30" />
                  <div className="text-xs font-semibold text-brand-blue">{t.year}</div>
                  <div className="text-sm text-slate-700">{t.text}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* METRICS STRIP */}
      <Section>
  <div className="container-app">
    <div className="grid sm:grid-cols-3 gap-4 rounded-2xl border bg-white p-4 text-center">
      {[
        { label: "Devices fixed", end: 10000, suffix: "+" },
        { label: "Average rating", end: 4.9, suffix: "/5", decimals: 1 },
        { label: "Same-day areas", end: 20, suffix: "+" },
      ].map((m) => (
        <Stat key={m.label} {...m} />
      ))}
    </div>
  </div>
</Section>

{/* MINI CASE STUDY */}
<Section>
  <div className="container-app">
    <div className="grid md:grid-cols-3 gap-6 items-stretch">
      <div className="md:col-span-2 rounded-2xl border bg-white p-6">
        <div className="text-xs uppercase tracking-wide text-brand-blue">Case study</div>
        <h3 className="mt-1 text-xl font-semibold text-brand-navy">
          “40 laptops ready for class by Monday”
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          A local school received a pallet of mixed-model laptops on Friday morning.
          We imaged devices, joined them to the network, installed required apps,
          and delivered them labelled and ready before first period on Monday.
        </p>
        <ul className="mt-3 text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li>Zero-touch imaging & naming convention</li>
          <li>Wi-Fi + content filter applied</li>
          <li>Inventory sheet delivered</li>
        </ul>
        <a href="/contact" className="mt-4 inline-block rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Start a similar project →
        </a>
      </div>
      <div className="rounded-2xl overflow-hidden border bg-white">
        <img
          src="/src/assets/about/casestudy.jpg"
          alt="Classroom rollout"
          className="h-full w-full object-cover md:h-full"
          loading="lazy"
        />
      </div>
    </div>
  </div>
</Section>


      {/* VALUES (refined) */}
      <Section muted>
        <div className="container-app">
          <H2 className="text-center">Our values</H2>
          <p className="text-center text-slate-600 max-w-2xl mx-auto mt-2">
            Straightforward service principles that guide every visit.
          </p>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Same-day reliability",
                blurb: "We turn up when we say — often within hours.",
              },
              {
                title: "Plain-English help",
                blurb: "Clear explanations and next steps, no jargon.",
              },
              {
                title: "Respect & care",
                blurb: "We treat your devices and home as our own.",
              },
              {
                title: "No Fix, No Fee",
                blurb: "If we can’t resolve it, you don’t pay.",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="rounded-xl border bg-white p-6 hover:shadow-md transition"
              >
                <div className="h-1 w-12 bg-gradient-to-r from-brand-blue to-brand-lightblue rounded-full" />
                <h3 className="mt-4 font-semibold text-brand-navy">{v.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{v.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* TEAM (simple teaser, optional) */}
      <Section>
        <div className="container-app">
          <H2 className="text-center">Meet the team</H2>
          <p className="text-center text-slate-600 mt-2">Real people, local support.</p>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Alex T.", role: "Lead Technician", img: "/src/assets/about/people.jpg" },
              { name: "Sam R.", role: "Networking Specialist", img: "/src/assets/about/people.jpg" },
              { name: "Casey M.", role: "Customer Support", img: "/src/assets/about/people.jpg" },
            ].map((p) => (
              <div key={p.name} className="rounded-xl overflow-hidden border bg-white">
                <img src={p.img} alt={p.name} className="h-44 w-full object-cover" />
                <div className="p-4">
                  <div className="font-semibold text-brand-navy">{p.name}</div>
                  <div className="text-sm text-slate-600">{p.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

{/* COVERAGE CALLOUT */}
<Section muted>
  <div className="container-app">
    <div className="rounded-2xl border bg-white p-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500">Service coverage</div>
        <h3 className="text-lg font-semibold text-brand-navy">Same-day support across Adelaide</h3>
        <p className="text-sm text-slate-600 mt-1">Check suburbs and availability on our map.</p>
      </div>
      <a
        href="/location"
        className="rounded-md bg-brand-blue text-white px-4 py-2 text-sm font-semibold hover:bg-brand-navy"
      >
        View service areas →
      </a>
    </div>
  </div>
</Section>


      {/* CTA BAND */}
      <Section>
        <div className="container-app">
          <div className="rounded-2xl overflow-hidden bg-brand-navy text-white p-8 md:p-10 relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue to-brand-lightblue" />
            <h3 className="text-2xl font-semibold italic">Ready for stress-free tech support?</h3>
            <p className="mt-2 text-white/80">
              Book a technician today — we’ll get you back on track quickly.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button variant="primary" to="/contact">Book Now</Button>
              <Button variant="secondary" className="border-white text-white hover:text-brand-navy" href="tel:1300551350">
                1300 551 350
              </Button>
            </div>
          </div>
        </div>
      </Section>
      
    </div>
  );
}
/* Helper component (add inside the same file, below the About component) */
function Stat({ label, end, suffix = "", decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40% 0px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 900; // ms
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const current = end * (0.2 + 0.8 * p); // start not from zero to feel snappier
      setVal(Number(current.toFixed(decimals)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, decimals]);

  return (
    <div ref={ref} className="rounded-xl bg-brand-lightblue/10 py-5">
      <div className="text-xl font-semibold text-brand-navy">
        {val}
        {suffix}
      </div>
      <div className="text-xs text-slate-600 mt-1">{label}</div>
    </div>
  );
}
