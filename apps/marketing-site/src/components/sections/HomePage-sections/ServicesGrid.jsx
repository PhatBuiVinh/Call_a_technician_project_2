import { motion } from "framer-motion";
import Section from "../../layout/Section";
import { H2 } from "../../UI/Heading";
import Button from "../../atoms/Button";
import fallbackImage from "../../../assets/tech-visit.jpg";

const getNextImageFallback = (src = "") => {
  if (/\.webp(?=($|\?))/i.test(src)) {
    return src.replace(/\.webp(?=($|\?))/i, ".png");
  }
  if (/\.png(?=($|\?))/i.test(src)) {
    return src.replace(/\.png(?=($|\?))/i, ".jpg");
  }
  return null;
};

export default function ServicesGrid({ items = [] }) {
  // Guard against bad input
  const list = Array.isArray(items) ? items : [];

  return (
    <Section>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-[3px] bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green rounded-full mx-auto" />
          <H2 className="mt-4">On-Site Computer Repair Services</H2>
          <p className="mt-2 text-slate-600">
            Don’t see your issue listed? <a className="link-animated text-brand-blue hover:text-brand-lightblue" href="tel:1300551350">Call us</a> — we can help.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((s, i) => {
            const CardTag = s?.href ? "a" : "div";
            const cardProps = s?.href ? { href: s.href } : {};
            return (
              <motion.div
                key={s.title ?? i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <CardTag
                  {...cardProps}
                  className="
                    group block rounded-[32px] border border-slate-200/50 bg-white p-6
                    motion-safe:hover:-translate-y-1 hover:border-brand-blue/35 transition-transform duration-200
                    focus-brand
                  "
                >
                  <div className="mb-4 h-36 w-full overflow-hidden rounded-2xl bg-slate-100">
                    <img
                      src={s.image || fallbackImage}
                      alt={s.imageAlt || s.title}
                      loading="lazy"
                      onError={(e) => {
                        const nextSrc = getNextImageFallback(e.currentTarget.getAttribute("src") || "");
                        if (nextSrc) {
                          e.currentTarget.setAttribute("src", nextSrc);
                          return;
                        }

                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackImage;
                      }}
                      className="h-full w-full object-cover motion-standard motion-safe:group-hover:scale-105"
                    />
                  </div>

                  {/* top accent */}
                  <div className="h-1 w-12 bg-gradient-to-r from-brand-blue to-brand-lightblue rounded-full" />

                  <div className="mt-4 flex items-start gap-3">
                    {/* icon chip (replace s.icon with lucide icon if you have it) */}
                    <div className="w-10 h-10 rounded-md bg-brand-lightblue/30 text-brand-blue grid place-items-center text-2xl shrink-0">
                      {s.icon ?? "🛠️"}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xl md:text-2xl font-semibold text-brand-navy">{s.title}</div>
                      <p className="mt-1 text-sm text-slate-600 line-clamp-3">{s.blurb}</p>

                      {/* optional bullets */}
                      {Array.isArray(s.bullets) && s.bullets.length > 0 && (
                        <ul className="mt-2 text-sm text-slate-600 space-y-1 list-disc list-inside">
                          {s.bullets.slice(0, 3).map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      )}

                      {/* footer row */}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="chip">
                          {s.price ?? "from $99"}
                        </span>
                        <span className="text-sm font-medium text-brand-blue group-hover:text-brand-lightblue">
                          {s?.href ? "Learn more →" : "Get help →"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardTag>
              </motion.div>
            );
          })}
        </div>

        {/* band below grid */}
        <div className="mt-8 rounded-2xl border border-slate-200/50 bg-brand-lightblue/10 p-4 text-sm text-slate-700 text-center">
          Can’t find your exact problem? Describe it on our{" "}
          <a href="/contact" className="link-animated text-brand-blue hover:text-brand-lightblue">
            contact form
          </a>{" "}
          or call <a className="link-animated text-brand-blue hover:text-brand-lightblue" href="tel:1300551350">1300 551 350</a>.
        </div>

        {/* view all CTA (optional) */}
        <div className="mt-6 flex justify-center">
          <Button to="/services" variant="secondary">View all services</Button>
        </div>
      </div>
    </Section>
  );
}
