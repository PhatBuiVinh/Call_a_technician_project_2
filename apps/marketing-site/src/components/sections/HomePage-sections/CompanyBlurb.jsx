import { motion } from "framer-motion";
import Section from "../../layout/Section";
import { H2 } from "../../ui/Heading";
import Button from "../../atoms/Button";
import { MapPin, Rocket, Users } from "lucide-react";

/**
 * Our Story split layout
 * - Left: large image (team / behind-the-scenes)
 * - Right: narrative + lightweight timeline
 *
 * Pass a real image via `imageUrl` later, or leave placeholder.
 */
export default function CompanyBlurb({
  imageUrl = "",
  title = "Started in Adelaide, Growing with You",
  intro = `Call-a-Technician began as a local Adelaide service helping neighbours fix everyday tech issues.
Today, we support homes and small businesses across South Australia with the same friendly, human approach.`,
  timeline = [
    { year: "2012", title: "Founded in Adelaide", icon: <MapPin className="w-4 h-4" /> },
    { year: "2018", title: "Expanded across SA", icon: <Rocket className="w-4 h-4" /> },
    { year: "Today", title: "5,000+ fixes & counting", icon: <Users className="w-4 h-4" /> },
  ],
}) {
  return (
    <Section>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* LEFT: Visual */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative rounded-2xl overflow-hidden border bg-white shadow-sm"
        >
          {/* Top gradient rule */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green" />

          <div className="aspect-video w-full bg-slate-100">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Our team at work"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-slate-500">
                Team / workplace photo
              </div>
            )}
          </div>

          {/* Subtle corner accent */}
          <div className="pointer-events-none absolute -left-4 -top-4 rotate-[-8deg]">
            <div className="h-2 w-28 bg-gradient-to-r from-brand-green to-brand-lightblue rounded-full opacity-90" />
          </div>
        </motion.div>

        {/* RIGHT: Story + Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, delay: 0.06, ease: "easeOut" }}
        >
          <H2>{title}</H2>
          <p className="mt-3 text-slate-700">{intro}</p>

          {/* Timeline */}
          <div className="mt-5">
            <ul className="relative">
              {/* vertical line */}
              <span className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />
              {timeline.map((t) => (
                <li key={t.year} className="relative pl-10 py-3">
                  {/* dot */}
                  <span className="absolute left-2 top-4 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-brand-blue ring-4 ring-brand-lightblue/30" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-brand-blue">{t.year}</span>
                    <span className="inline-flex items-center gap-1 text-sm text-brand-navy">
                      {t.icon}
                      <span className="font-medium">{t.title}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA row */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button variant="primary" to="/contact">Book a Technician</Button>
            <Button
              variant="secondary"
              className="border-brand-blue text-brand-blue hover:text-brand-navy"
              to="/about"
            >
              Learn more about us
            </Button>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
