import { Link } from "react-router-dom";
import Section from "../components/layout/Section";
import { H2 } from "../components/UI/Heading";
import Button from "../components/atoms/Button";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Clock3, ShieldCheck, MapPin, Users, Wrench,
  MessageCircle, BadgeCheck, Heart, Lightbulb
} from "lucide-react";
import aboutTeamImg from "../assets/tech-visit.jpg";
import caseStudyImg from "../assets/about/casestudy.jpg";
import caseStudy1Img from "../assets/hero-team.jpg";
import founderImg from "../assets/about/Mustafa Kadir.png";

/* ─── VALUES DATA ─── */
const VALUES = [
  {
    icon: Clock3,
    color: "bg-blue-50 text-brand-blue",
    title: "Same-day service",
    blurb: "We show up when you need us — often within hours. No two-day wait, no weekends-only schedule.",
    proof: "Confirmed within the hour",
  },
  {
    icon: MessageCircle,
    color: "bg-emerald-50 text-emerald-600",
    title: "Plain English, always",
    blurb: "We explain what went wrong and how we fixed it — in language you'll actually understand.",
    proof: "No jargon, ever",
  },
  {
    icon: Heart,
    color: "bg-rose-50 text-rose-500",
    title: "Respect for your home",
    blurb: "We treat every home and office as if it were our own — tidy, careful and considerate.",
    proof: "Work done in front of you",
  },
  {
    icon: ShieldCheck,
    color: "bg-violet-50 text-violet-600",
    title: "No Fix, No Fee promise",
    blurb: "If we can't resolve the problem, you owe us nothing for the visit. Simple as that.",
    proof: "Every job, every time",
  },
];

/* ─── CASE STUDIES ─── */
const CASE_STUDIES = [
  {
    tag: "Home User · Burnside",
    title: '"My laptop wouldn\'t turn on at all — back running the same day"',
    body: "A local family called us on a Sunday morning after their main laptop stopped responding overnight. We attended by midday, diagnosed a failed power management chip, sourced the part from a local supplier, and had the laptop fully operational before dinner — with all data intact.",
    points: [
      "Same-day Sunday attendance",
      "Full hardware diagnosis onsite",
      "Data confirmed safe before repair",
      "Part sourced and fitted within hours",
      "No fix, no fee — only paid on success",
    ],
    cta: "Book a same-day repair →",
    img: caseStudy1Img,
  },
  {
    tag: "Small Business · Norwood",
    title: '"Office internet kept dropping — sorted in one visit"',
    body: "A four-person accounting office had been suffering from intermittent Wi-Fi dropouts for three months. We replaced their ageing router with a business-grade unit, set up a guest network, and configured quality-of-service rules to prioritise their accounting software. Zero dropouts since.",
    points: [
      "Root cause found in under 30 minutes",
      "Business-grade router installed & configured",
      "Guest network + QoS rules applied",
      "Zero downtime during the upgrade",
      "Written network documentation provided",
    ],
    cta: "Book a network visit →",
    img: caseStudyImg,
  },
];

export default function About() {
  return (
    <div className="text-slate-800">

      {/* ═══ HERO ═══ */}
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
              <div className="max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-blue/25 bg-brand-blue/10 text-brand-navy text-xs font-semibold px-4 py-1.5 mb-5">
                  <MapPin className="h-3.5 w-3.5" /> Based in Adelaide, SA
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                  Adelaide's local IT expert —<br className="hidden md:block" />
                  <span className="text-brand-blue"> we come to you.</span>
                </h1>
                <p className="mt-4 text-slate-600 text-lg leading-relaxed">
                  Call-a-Technician delivers same-day, onsite tech support to homes and small businesses across Adelaide. No jargon, no device drop-offs, no surprises — and if we can't fix it, you don't pay.
                </p>
                <div className="mt-8 flex flex-wrap gap-4 justify-center">
                  <Button variant="primary" className="px-6 py-3" to="/contact">Book a Technician</Button>
                  <a
                    href="tel:1300551350"
                    className="inline-flex items-center gap-2 rounded-md border border-brand-blue/50 bg-transparent text-brand-blue px-6 py-3 font-semibold hover:bg-brand-blue/10 active:bg-brand-blue/20 hover:-translate-y-0.5 transition-all duration-200 text-sm"
                  >
                    Call 1300 551 350
                  </a>
                </div>
                <div className="mt-8 flex flex-wrap gap-6 justify-center text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-brand-blue" /> 24/7 availability</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand-blue" /> 420+ suburbs</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-brand-blue" /> No Fix, No Fee</span>
                  <span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-brand-blue" /> 4.6/5 rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ OUR STORY ═══ */}
      <Section>
        <div className="container-app grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl overflow-hidden shadow-lg border"
          >
            <img
              src={aboutTeamImg}
              alt="Call-a-Technician onsite at a customer's home"
              className="w-full h-72 md:h-96 object-cover object-top"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: 0.07 }}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-brand-blue mb-2">Our story</div>
            <H2>Built on a simple idea</H2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Call-a-Technician was founded by Mustafa Kadir, a certified IT technician and system administrator who spent years watching people struggle with tech problems that should have been quick, affordable fixes — if only help came to them instead of the other way around.
            </p>
            <p className="mt-3 text-slate-600 leading-relaxed">
              So he built a service that does exactly that. We come to your home or office, fix the problem in front of you, and leave you with a clear explanation of what happened and how to avoid it next time. No device handovers. No waiting rooms. No jargon.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              {[
                { value: "5,000+", label: "Jobs completed" },
                { value: "4.6/5", label: "Customer rating" },
                { value: "420+", label: "Suburbs covered" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-brand-blue/5 py-4 px-2">
                  <div className="text-xl font-bold text-brand-navy">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ═══ CASE STUDIES ═══ */}
      <Section muted>
        <div className="container-app">
          <div className="text-center mb-8">
            <div className="w-16 h-[3px] bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green rounded-full mx-auto" />
            <H2 className="mt-4">Real jobs, real results</H2>
            <p className="mt-2 text-slate-600 max-w-xl mx-auto">
              A sample of how we've helped Adelaide homes and businesses.
            </p>
          </div>

          <div className="space-y-6">
            {CASE_STUDIES.map((cs, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="grid md:grid-cols-[1fr_280px] gap-0 rounded-2xl border bg-white overflow-hidden shadow-sm"
              >
                <div className="p-6 md:p-8">
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand-blue mb-2">
                    {cs.tag}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-brand-navy leading-snug">
                    {cs.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{cs.body}</p>
                  <ul className="mt-4 space-y-1.5">
                    {cs.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-slate-700">
                        <BadgeCheck className="h-4 w-4 text-brand-green shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact"
                    className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:text-brand-navy transition"
                  >
                    {cs.cta}
                  </Link>
                </div>
                <div className="hidden md:block">
                  <img
                    src={cs.img}
                    alt="Case study"
                    className="h-full w-full object-cover"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ VALUES ═══ */}
      <Section>
        <div className="container-app">
          <div className="text-center mb-10">
            <div className="w-16 h-[3px] bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green rounded-full mx-auto" />
            <H2 className="mt-4">What we stand for</H2>
            <p className="mt-2 text-slate-600 max-w-xl mx-auto">
              Four principles that shape every single visit.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.38, delay: i * 0.08 }}
                className="rounded-2xl border bg-white p-6 hover:shadow-md transition group flex flex-col"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${v.color} group-hover:scale-110 transition`}>
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-bold text-brand-navy">{v.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-1">{v.blurb}</p>
                <div className="mt-4 text-[11px] font-semibold text-brand-blue bg-brand-blue/10 rounded-full px-3 py-1.5 text-center">
                  {v.proof}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ FOUNDER ═══ */}
      <Section muted>
        <div className="container-app">
          <div className="text-center mb-10">
            <div className="w-16 h-[3px] bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green rounded-full mx-auto" />
            <H2 className="mt-4">Meet the founder</H2>
            <p className="mt-2 text-slate-600">The person behind Call-a-Technician.</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="grid md:grid-cols-[280px_1fr]">
                {/* Photo side */}
                <div className="relative bg-brand-navy flex flex-col items-center justify-center p-8 md:p-10">
                  <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white/20 shadow-xl">
                    <img
                      src={founderImg}
                      alt="Mustafa Kadir — Founder of Call-a-Technician"
                      className="w-full h-full object-cover object-center scale-110 transform"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <div className="font-bold text-white text-lg">Mustafa Kadir</div>
                    <div className="text-brand-green text-sm font-medium">Founder & Lead Technician</div>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {["System Admin", "Cybersecurity", "Networking", "Data Recovery"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/10 text-white text-[11px] font-medium px-3 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bio side */}
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <blockquote className="text-brand-navy italic text-lg font-medium leading-relaxed border-l-4 border-brand-green pl-4">
                    "Everyone deserves fast, honest tech support — without the jargon and without the wait."
                  </blockquote>
                  <p className="mt-5 text-slate-600 leading-relaxed">
                    Mustafa holds certifications in IT systems and network administration, with over 20 years of hands-on experience supporting both home users and businesses across South Australia. He founded Call-a-Technician after seeing too many people overpay for slow, impersonal service at big-box repair chains.
                  </p>
                  <p className="mt-3 text-slate-600 leading-relaxed">
                    Every Call-a-Technician service visit is held to the same standard the business was built on — honest advice, transparent pricing, and work carried out with genuine care and attention.
                  </p>
                  <p className="mt-3 text-slate-600 leading-relaxed">
                    Mustafa is an active member of the <strong className="text-brand-navy">Australian Computer Society (ACS)</strong>, currently serving as Chair and Member of Congress for the South Australia branch. He has held positions on the ACS Membership Advisory Board and previously served as Honorary Treasurer — bringing professional governance and industry accountability to everything he does.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Wrench className="h-4 w-4 text-brand-blue" /> 20+ years experience
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Users className="h-4 w-4 text-brand-blue" /> 5,000+ jobs completed
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Lightbulb className="h-4 w-4 text-brand-blue" /> Microsoft & CompTIA certified
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button variant="primary" to="/contact" className="px-6 py-2.5">
                      Book with Mustafa
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ COVERAGE TEASER ═══ */}
      <Section>
        <div className="container-app">
          <div className="rounded-2xl border bg-white p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-brand-blue" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Service coverage</div>
                <h3 className="text-lg font-bold text-brand-navy">Same-day support across Adelaide</h3>
                <p className="text-sm text-slate-600 mt-0.5">We cover 420+ suburbs across the Adelaide metro area and surrounding regions.</p>
              </div>
            </div>
            <a
              href="/service-areas"
              className="shrink-0 rounded-xl bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold hover:bg-brand-navy transition"
            >
              View all service areas →
            </a>
          </div>
        </div>
      </Section>

      {/* ═══ CTA BAND ═══ */}
      <Section muted>
        <div className="container-app">
          <div className="rounded-2xl bg-brand-navy text-white p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green" />
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-bold">Ready for stress-free tech support?</h3>
              <p className="mt-2 text-white/75 max-w-xl">
                Book a technician today — we'll come to you, fix the problem, and leave you back in control.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="primary" to="/contact" className="px-7 py-3">
                  Book Now
                </Button>
                <a
                  href="tel:1300551350"
                  className="rounded-xl border-2 border-white/30 text-white px-7 py-3 font-semibold hover:border-white hover:bg-white/10 transition text-sm"
                >
                  Call 1300 551 350
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>

    </div>
  );
}

function Stat({ label, end, suffix = "", decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40% 0px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 900;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const current = end * (0.2 + 0.8 * p);
      setVal(Number(current.toFixed(decimals)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, decimals]);

  return (
    <div ref={ref} className="rounded-xl bg-brand-lightblue/10 py-5">
      <div className="text-xl font-semibold text-brand-navy">
        {val}{suffix}
      </div>
      <div className="text-xs text-slate-600 mt-1">{label}</div>
    </div>
  );
}
