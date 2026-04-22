import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Wrench, Handshake } from "lucide-react";
import WhyUs from "./WhyUs";
import ServicesGrid from "./ServicesGrid";
import Testimonials from "./Testimonials";
import trustThumb from "../../../assets/team.jpg";
import solutionsThumb from "../../../assets/tech-visit.jpg";
import proofThumb from "../../../assets/hero-team.jpg";

const CHAPTERS = [
  {
    id: "trust",
    title: "Trust First",
    description: "Proof and comparison so visitors understand why your team is the safer choice.",
    thumb: trustThumb,
    alt: "Technicians helping customers on-site",
    Icon: ShieldCheck,
  },
  {
    id: "solutions",
    title: "Solutions That Fit",
    description: "Service options organized for speed, clarity, and confidence before contact.",
    thumb: solutionsThumb,
    alt: "Technician working on laptop and router",
    Icon: Wrench,
  },
  {
    id: "proof",
    title: "Real Customer Proof",
    description: "Social evidence and outcomes that reduce hesitation at decision moment.",
    thumb: proofThumb,
    alt: "Happy customer after successful repair",
    Icon: Handshake,
  },
];

export default function HomeStoryFlow({ services }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const nodesRef = useRef([]);

  useEffect(() => {
    if (!nodesRef.current.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number(entry.target.getAttribute("data-story-index") || 0);
          setActiveIndex(idx);
        });
      },
      { threshold: 0.45, rootMargin: "-12% 0px -24% 0px" }
    );

    nodesRef.current.forEach((node) => node && observer.observe(node));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="section-feature relative bg-gradient-to-b from-brand-lightblue/10 via-white to-brand-lightblue/5">
      <div className="container-app grid lg:grid-cols-[250px_1fr] gap-7 lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-2xl border border-brand-blue/15 bg-white/85 backdrop-blur p-4 shadow-sm">
            <div className="text-xs font-semibold tracking-wide text-brand-blue">Story Flow</div>
            <div className="mt-2 text-sm text-slate-600">A guided scroll through the reasons to choose us.</div>

            <div className="mt-4 relative">
              <div className="absolute left-[7px] top-0 h-full w-[2px] bg-slate-200" />
              <div
                className="absolute left-[7px] top-0 w-[2px] bg-brand-blue motion-standard"
                style={{ height: `${((activeIndex + 1) / CHAPTERS.length) * 100}%` }}
              />
              <div className="space-y-4">
                {CHAPTERS.map((chapter, idx) => {
                  const active = idx <= activeIndex;
                  return (
                    <div key={chapter.id} className="relative pl-6">
                      <span
                        className={`absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 motion-standard ${
                          active ? "border-brand-blue bg-brand-blue" : "border-slate-300 bg-white"
                        }`}
                      />
                      <div className={`text-sm font-semibold ${active ? "text-brand-navy" : "text-slate-500"}`}>
                        {chapter.title}
                      </div>
                      <div className="text-xs text-slate-500">Chapter {idx + 1}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-7">
          {CHAPTERS.map((chapter, idx) => (
            <article
              key={chapter.id}
              data-story-index={idx}
              ref={(el) => {
                nodesRef.current[idx] = el;
              }}
              className="rounded-2xl border border-brand-blue/15 bg-white/70 overflow-hidden"
            >
              <div className="border-b border-slate-200/80 bg-gradient-to-r from-white to-brand-lightblue/10">
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  <img
                    src={chapter.thumb}
                    alt={chapter.alt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy/60 via-brand-navy/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-brand-blue">
                      <chapter.Icon className="h-3.5 w-3.5" />
                      Chapter {idx + 1}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <h3 className="text-xl font-semibold text-brand-navy">{chapter.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{chapter.description}</p>
                </div>
              </div>

              {idx === 0 && <WhyUs />}
              {idx === 1 && <ServicesGrid items={services} />}
              {idx === 2 && <Testimonials />}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
