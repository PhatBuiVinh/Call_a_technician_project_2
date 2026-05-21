import { Link } from "react-router-dom";
import Section from "../components/layout/Section";
import Button from "../components/atoms/Button";
import { H2 } from "../components/UI/Heading";
import {
  ShieldCheck, CheckCircle2, AlertTriangle, Target, FileText,
  ClipboardCheck, BookOpen, Users, TrendingUp, Award,
} from "lucide-react";
import grcWhoWeWorkWithImg from "../assets/consulting/grc-who-we-work-with.jpg";

// ─── GRC page data ────────────────────────────────────────────────────────────
const GRC_SERVICES = [
  {
    icon: Target,
    title: "Risk Assessment",
    blurb: "Identify and prioritise threats to your assets with a structured risk register and clear remediation roadmap.",
  },
  {
    icon: FileText,
    title: "Governance & Policy",
    blurb: "Create IT security policies and governance frameworks aligned to your regulatory obligations.",
  },
  {
    icon: ClipboardCheck,
    title: "Compliance Management",
    blurb: "Navigate Essential 8, APRA CPS 234, and the Australian Privacy Act with documented, audit-ready evidence.",
  },
  {
    icon: AlertTriangle,
    title: "Incident Response Planning",
    blurb: "Build and test response plans so your team acts decisively and correctly when a breach occurs.",
  },
  {
    icon: BookOpen,
    title: "GRC Documentation",
    blurb: "Deliver risk registers, audit evidence packages, and compliance reports your board can act on.",
  },
  {
    icon: Users,
    title: "Security Awareness Training",
    blurb: "Train staff to spot phishing, social engineering, and AI-powered threats before they cause damage.",
  },
];

const GRC_PROCESS = [
  {
    n: "01",
    title: "Initial Consultation",
    text: "We discuss your current posture, industry obligations and immediate risks — no jargon, no sales pressure.",
  },
  {
    n: "02",
    title: "Gap Analysis & Report",
    text: "A thorough review of your existing controls against relevant frameworks to identify and prioritise gaps.",
  },
  {
    n: "03",
    title: "Roadmap Delivery",
    text: "A clear, prioritised action plan with timelines, responsibilities and estimated effort — ready to act on.",
  },
  {
    n: "04",
    title: "Ongoing Advisory",
    text: "Regular reviews, policy updates and audit support as your organisation evolves and regulations change.",
  },
];

const WHO_WE_WORK_WITH = [
  { label: "Small & medium businesses",        detail: "Essential 8, security policies & risk registers" },
  { label: "Medical & allied health",          detail: "Privacy Act, My Health Record, RACGP alignment" },
  { label: "Schools & education providers",    detail: "Student data protection & ACSC guidelines" },
  { label: "Non-profits & community orgs",     detail: "Lightweight frameworks, grant-ready documentation" },
  { label: "Law firms & legal practices",      detail: "Client confidentiality & data handling obligations" },
  { label: "Financial services & accounting",  detail: "APRA CPS 234 & ASIC cyber resilience" },
  { label: "Construction & engineering",       detail: "Project data security & IP protection" },
  { label: "Aged care & disability services",  detail: "NDIS Practice Standards & privacy obligations" },
];

const THREAT_STATS = [
  { value: "1 in 2",  label: "Australian SMBs impacted by a cyber incident in the past year" },
  { value: "$4.03M",  label: "Average cost of a data breach in Australia (IBM Security 2024)" },
  { value: "94%",     label: "Of attacks delivered via email — AI is making them harder to detect" },
];


// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Consulting() {
  return (
    <div className="text-slate-800">

      {/* ─── HERO ─── */}
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
                <div className="w-12 h-1 bg-gradient-to-r from-brand-blue to-brand-navy rounded-full mb-5 mx-auto" />
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                  GRC Consulting for<br className="hidden md:block" />
                  <span className="text-brand-blue"> Adelaide Businesses</span>
                </h1>
                <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
                  Governance, Risk &amp; Compliance expertise — without the enterprise price tag. We help Adelaide businesses protect their operations, meet regulatory obligations, and build resilience against modern cyber threats.
                </p>
                <div className="mt-7 flex flex-wrap gap-3 justify-center">
                  <Button variant="primary" className="px-6 py-3" to="/contact">
                    Book a Consultation
                  </Button>
                  <a
                    href="tel:1300551350"
                    className="inline-flex items-center gap-2 rounded-md border border-brand-blue/50 bg-transparent text-brand-blue px-6 py-3 font-semibold hover:bg-brand-blue/10 active:bg-brand-blue/20 hover:-translate-y-0.5 transition-all duration-200 text-sm"
                  >
                    Call 1300 551 350
                  </a>
                </div>
                <div className="mt-6 flex flex-wrap gap-5 justify-center text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Award       className="h-4 w-4 text-brand-blue" /> Written scope before work starts</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck  className="h-4 w-4 text-brand-blue" /> No retainer required</span>
                  <span className="flex items-center gap-1.5"><TrendingUp   className="h-4 w-4 text-brand-blue" /> Essential 8 &amp; ISO 27001 aligned</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHY GRC MATTERS ─── */}
      <Section className="bg-white border-y">
        <div className="container-app">
          <div className="text-center mb-8">
            <H2>The risk is real — and growing</H2>
            <p className="mt-2 text-slate-600 max-w-xl mx-auto">
              Cyber threats are no longer just an enterprise concern. Australian SMBs are now prime targets.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {THREAT_STATS.map(s => (
              <div key={s.label} className="rounded-2xl border bg-brand-navy text-white p-6 text-center shadow-sm">
                <div className="text-3xl font-bold text-brand-green">{s.value}</div>
                <div className="text-sm text-white/75 mt-2 leading-relaxed">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── GRC SERVICES ─── */}
      <Section>
        <div className="container-app">
          <div className="text-center mb-10">
            <div className="w-16 h-[3px] bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green rounded-full mx-auto" />
            <H2 className="mt-4">Our GRC Consulting Services</H2>
            <p className="mt-2 text-slate-600 max-w-xl mx-auto">
              Practical governance, risk and compliance services for organisations of all sizes.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GRC_SERVICES.map(s => (
              <div key={s.title} className="rounded-xl border bg-white p-6 hover:shadow-md transition group flex flex-col">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-lightblue/20 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-brand-navy">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-1">{s.blurb}</p>
                <Link to="/contact" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:text-brand-navy transition">
                  Enquire →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── LIVE THREAT INTELLIGENCE ─── */}
      <Section muted>
        <div className="container-app">
          <div className="text-center mb-8">
            <div className="w-16 h-[3px] bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green rounded-full mx-auto" />
            <H2 className="mt-4">Real-Time Global Cybersecurity Activity</H2>
            <p className="mt-2 text-slate-600 max-w-xl mx-auto">
              The map below displays cyber threats detected <strong className="text-slate-700">live and in real time</strong> by Kaspersky's global network of sensors. Attack counters reset every 24 hours at midnight GMT — the figures shown represent genuine threats detected since 00:00 GMT today.
            </p>
          </div>

          <div className="max-w-4xl mx-auto flex justify-center">
            <iframe
              width="100%"
              height="600"
              src="https://cybermap.kaspersky.com/en/widget/dynamic/dark"
              frameBorder="0"
              className="rounded-xl border shadow-lg"
              title="Kaspersky Cyberthreat Live Map"
            />
          </div>

          {/* Attribution */}
          <p className="mt-3 max-w-4xl mx-auto text-xs text-slate-400 text-center">
            This map is provided by{" "}
            <a href="https://cybermap.kaspersky.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-blue">
              Kaspersky Cyberthreat Real-Time Map
            </a>
            {" "}and is embedded here for informational purposes only. Call-a-Technician does not own or operate this tool. Data accuracy, availability, and content are subject to{" "}
            <a href="https://www.kaspersky.co.uk/terms-of-use" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-blue">
              Kaspersky's Terms of Use
            </a>. Call-a-Technician accepts no liability for the content or availability of this third-party service.
          </p>

          {/* CTA below map */}
          <div className="mt-8 max-w-4xl mx-auto rounded-xl bg-brand-blue/5 border border-brand-blue/15 p-6 text-center">
            <strong className="text-brand-navy text-lg block mb-2">Threats are evolving constantly — is your organisation prepared?</strong>
            <p className="text-slate-600 mb-6">A GRC assessment identifies your specific cyber risks and builds a practical roadmap to address them.</p>
            <Button variant="primary" to="/contact">
              Book a GRC Assessment
            </Button>
          </div>
        </div>
      </Section>

      {/* ─── PROCESS ─── */}
      <Section>
        <div className="container-app">
          <H2 className="text-center">How our GRC engagement works</H2>
          <p className="mt-2 text-center text-slate-600">A structured, transparent process — no surprises, no lock-in.</p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GRC_PROCESS.map(p => (
              <div key={p.n} className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue text-white font-semibold text-sm">
                  {p.n}
                </div>
                <h3 className="mt-4 font-semibold text-brand-navy">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── WHO WE WORK WITH ─── */}
      <Section muted>
        <div className="container-app">

          {/* ── Header — full width, centred ── */}
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-blue mb-2">Who we work with</div>
            <H2>Organisations that need GRC without the enterprise cost</H2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We partner with Adelaide organisations that have real compliance obligations but don't need a full-time GRC team on the payroll.
            </p>
          </div>

          {/* ── Image left · list right — image stretches to match content ── */}
          <div className="grid md:grid-cols-2 gap-10 items-stretch">

            {/* Left — image fills the full height of the right column */}
            <div className="rounded-2xl overflow-hidden shadow-lg border">
              <img
                src={grcWhoWeWorkWithImg}
                alt="GRC consulting meeting with Adelaide business"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Right — evenly spaced list + button at bottom */}
            <div className="flex flex-col justify-between py-1">
              {WHO_WE_WORK_WITH.map(item => (
                <div key={item.label} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <CheckCircle2 className="h-5 w-5 text-brand-green shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-brand-navy leading-snug">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                  </div>
                </div>
              ))}
              <div className="pt-5">
                <Button variant="primary" to="/contact" className="px-6 py-2.5">
                  Talk to a GRC Consultant
                </Button>
              </div>
            </div>
          </div>

        </div>
      </Section>

      {/* ─── CTA BAND ─── */}
      <Section muted>
        <div className="container-app">
          <div className="rounded-2xl overflow-hidden bg-brand-navy text-white p-8 md:p-10 relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue to-brand-lightblue" />
            <div className="max-w-xl">
              <h3 className="text-2xl font-bold text-white">Is your organisation ready for what's coming?</h3>
              <p className="mt-2 text-white/80 leading-relaxed">
                Gen AI threats, tightening compliance requirements, and a growing attack surface mean there has never been a more important time to get your GRC foundations right. Let's talk.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button variant="primary" to="/contact">Book a Consultant</Button>
                <a
                  href="tel:1300551350"
                  className="rounded-md border border-white/40 text-white px-6 py-2.5 font-semibold hover:bg-white/10 transition text-sm"
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
