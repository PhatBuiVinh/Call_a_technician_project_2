import { BookOpen, Shield, Lightbulb } from "lucide-react";

const TOPICS = [
  { icon: BookOpen, label: "How-to guides" },
  { icon: Shield, label: "Security tips" },
  { icon: Lightbulb, label: "Troubleshooting" },
];

export default function BlogHero() {
  return (
    <section className="bg-white px-4 md:px-8 py-6 md:py-8">
      <div className="max-w-7xl mx-auto">
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ background: "linear-gradient(135deg, #EBF3FF 0%, #D0E4FF 45%, #EBF3FF 100%)" }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: "radial-gradient(circle, rgba(26,88,211,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
          <div className="relative z-10 px-6 md:px-12 py-14 md:py-20 text-center">
            <div className="w-12 h-1 bg-gradient-to-r from-brand-blue to-brand-navy rounded-full mb-5 mx-auto" />
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
              Tech Insights &amp; Guides
            </h1>
            <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Practical guides, troubleshooting tips and security advice from our technicians — written for real people, not IT departments.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              {TOPICS.map((topic) => {
                const TopicIcon = topic.icon;
                return (
                  <span
                    key={topic.label}
                    className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-white/70 text-slate-700 text-xs font-medium px-3 py-1.5"
                  >
                    <TopicIcon className="h-3.5 w-3.5 text-brand-blue" /> {topic.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
