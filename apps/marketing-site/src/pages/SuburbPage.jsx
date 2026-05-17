import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { SUBURB_COORDS } from "../data/suburbCoordinates";
import {
  MapPin, Phone, Clock, ArrowRight, CheckCircle2,
  Laptop, Shield, Wifi, HardDrive, Cpu, Building2,
} from "lucide-react";
import Section from "../components/layout/Section";
import Button from "../components/atoms/Button";
import {
  SUBURB_POSTCODES,
  parseSuburbSlug,
  slugToSuburbName,
  toSuburbSlug,
} from "../data/suburbPostcodes";
import { getSuburbDescription, getNearbySuburbs } from "../data/suburbData";
import techVisitImg from "../assets/tech-visit.jpg";

// All suburb images (specific + pool) — supports both jpg and png
const suburbImages = import.meta.glob("../assets/suburbs/*.{jpg,png}", { eager: true });

// Pool images: pool-01.jpg/png … pool-XX — used when no suburb-specific image exists
const poolImageUrls = Object.keys(suburbImages)
  .filter((k) => /\/pool-\d+\.(jpg|png)$/.test(k))
  .sort()
  .map((k) => suburbImages[k]?.default)
  .filter(Boolean);

// Same suburb always gets the same pool image (deterministic hash)
function pickPoolImage(suburbName) {
  if (poolImageUrls.length === 0) return null;
  let hash = 0;
  for (let i = 0; i < suburbName.length; i++) {
    hash = (hash * 31 + suburbName.charCodeAt(i)) & 0xffffffff;
  }
  return poolImageUrls[Math.abs(hash) % poolImageUrls.length];
}

const SERVICES = [
  {
    icon: <Laptop className="h-7 w-7" />,
    title: "Laptop & Desktop Repairs",
    text: "Slow boot, cracked screen, or won't start at all — we fix PC and Mac hardware and software faults at your door.",
  },
  {
    icon: <Shield className="h-7 w-7" />,
    title: "Virus & Malware Removal",
    text: "Thorough removal of viruses, ransomware, and spyware, followed by protection setup to keep your device clean.",
  },
  {
    icon: <Wifi className="h-7 w-7" />,
    title: "Wi-Fi & Network Setup",
    text: "Fix dead zones, dropouts, and slow speeds. We configure home and business networks that stay reliable.",
  },
  {
    icon: <HardDrive className="h-7 w-7" />,
    title: "Data Backup & Recovery",
    text: "Recover files from failed drives and set up automated backups so important data is never permanently lost.",
  },
  {
    icon: <Cpu className="h-7 w-7" />,
    title: "Hardware Upgrades",
    text: "RAM upgrades, SSD replacements, and battery swaps to bring ageing devices back to full performance.",
  },
  {
    icon: <Building2 className="h-7 w-7" />,
    title: "Small Business IT Support",
    text: "Email setup, network management, and ongoing onsite support for local businesses who need technology they can rely on.",
  },
];

const PILLARS = [
  {
    icon: <Clock className="h-6 w-6 text-brand-blue" />,
    title: "Same-day service",
    text: "We aim to reach most addresses within hours of your booking — no multi-day wait.",
    tag: "7 days a week",
  },
  {
    icon: <MapPin className="h-6 w-6 text-brand-green" />,
    title: "We come to you",
    text: "Your technician arrives at your home or office. No shop drop-offs, no waiting in queues.",
    tag: "Fully onsite",
  },
  {
    icon: <span className="font-extrabold text-brand-blue text-xl leading-none">$</span>,
    title: "Transparent pricing",
    text: "From $165 per hour with no surprise charges. You know the cost before work begins.",
    tag: "No hidden fees",
  },
  {
    icon: <CheckCircle2 className="h-6 w-6 text-brand-green" />,
    title: "No Fix, No Fee",
    text: "If we cannot resolve the problem, you owe nothing for the visit. That is our promise on every job.",
    tag: "Guaranteed",
  },
];

const WHY_COLS = [
  {
    heading: "We come to you",
    points: [
      "Onsite visits — no device drop-off required",
      "Available every day, including public holidays",
    ],
  },
  {
    heading: "Your device stays with you",
    points: [
      "All work completed at your home or office",
      "Your files and accounts stay private",
    ],
  },
  {
    heading: "Honest, straightforward service",
    points: [
      "Plain English — we explain everything clearly",
      "No Fix, No Fee on every single job",
    ],
  },
];

function SuburbMap({ currentSuburb }) {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />;
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 400, isolation: "isolate" }}>
      <MapContainer
        center={[-34.9285, 138.6007]}
        zoom={10}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {Object.entries(SUBURB_COORDS).map(([name, [lat, lng]]) => {
          const isCurrent = name === currentSuburb;
          return (
            <CircleMarker
              key={name}
              center={[lat, lng]}
              radius={isCurrent ? 7 : 4}
              pathOptions={{
                color: isCurrent ? "#16A34A" : "#2563EB",
                fillColor: isCurrent ? "#16A34A" : "#2563EB",
                fillOpacity: isCurrent ? 1 : 0.6,
                weight: isCurrent ? 3 : 1.5,
              }}
              eventHandlers={{
                click: () => navigate(`/computer-repairs/${toSuburbSlug(name)}`),
                mouseover: (e) => e.target.setStyle({ fillOpacity: 1, weight: 3 }),
                mouseout: (e) => e.target.setStyle({ fillOpacity: isCurrent ? 1 : 0.6, weight: isCurrent ? 3 : 1.5 }),
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
                <span style={{ display: "block", fontSize: 11, color: "#64748b" }}>Click to view suburb page</span>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default function SuburbPage() {
  const { slug } = useParams();
  const { suburbSlug, postcode: postcodeFromSlug } = parseSuburbSlug(slug);
  const displayName = slugToSuburbName(suburbSlug);
  const postcode = postcodeFromSlug || SUBURB_POSTCODES[displayName] || "";
  const { short: shortDesc, long: longDesc } = getSuburbDescription(displayName, postcode);
  const nearbySuburbs = getNearbySuburbs(displayName, 8);

  // Priority: 1) suburb jpg  2) suburb png  3) pool image  4) default fallback
  const slug_ = toSuburbSlug(displayName);
  const heroImg =
    suburbImages[`../assets/suburbs/${slug_}.jpg`]?.default ??
    suburbImages[`../assets/suburbs/${slug_}.png`]?.default ??
    pickPoolImage(displayName) ??
    techVisitImg;

  return (
    <div className="text-slate-800">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0F172A 0%, #0d3cb5 45%, #0F172A 100%)" }}
      >
        {/* Dot grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Two-column layout — matches home page hero exactly */}
        <div className="relative flex flex-col lg:flex-row min-h-[560px] lg:min-h-[620px]">

          {/* LEFT — text panel */}
          <div
            className="relative z-10 flex items-center lg:w-[52%] shrink-0 py-14 px-6 md:px-10"
            style={{ paddingLeft: "max(1.5rem, calc((100vw - 1280px) / 2 + 1.5rem))" }}
          >
            <div className="max-w-[430px]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 text-white text-xs font-semibold px-4 py-1.5 mb-5">
                <MapPin className="h-3.5 w-3.5" />
                Serving {displayName}{postcode && ` ${postcode}`}, SA
              </span>

              <h1 className="text-3xl md:text-4xl lg:text-[44px] font-bold text-white leading-tight">
                Computer Repairs in{" "}
                <span className="text-brand-green">{displayName}</span>
              </h1>
              {postcode && (
                <p className="text-white/60 text-lg font-normal mt-1">SA {postcode}</p>
              )}

              <p className="mt-4 text-white/75 text-base md:text-lg leading-relaxed">
                {shortDesc}
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Button variant="primary" to="/contact" className="px-7 py-3 text-base whitespace-nowrap">
                  Book a Technician in {displayName}
                </Button>
                <a
                  href="tel:1300551350"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 text-white px-7 py-3 font-semibold hover:bg-white/20 transition text-sm whitespace-nowrap"
                >
                  <Phone className="h-4 w-4" />
                  Call 1300 551 350
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-brand-green" /> 24/7 every day</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand-green" /> 420+ suburbs</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-brand-green" /> No Fix, No Fee</span>
              </div>
            </div>
          </div>

          {/* RIGHT — image fills full right half, blended edges (desktop only) */}
          <div className="hidden lg:block relative flex-1 overflow-hidden">
            <img
              src={heroImg}
              alt={`Computer repairs and IT support in ${displayName}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient blend — left edge (image fades into blue gradient) */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-40 lg:w-56 pointer-events-none z-10"
              style={{ background: "linear-gradient(to right, #0d3cb5, transparent)" }}
            />
            {/* Gradient blend — top edge */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-20 pointer-events-none z-10"
              style={{ background: "linear-gradient(to bottom, #0F172A, transparent)" }}
            />
            {/* Gradient blend — bottom edge */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-24 pointer-events-none z-10"
              style={{ background: "linear-gradient(to top, #0F172A, transparent)" }}
            />
          </div>
        </div>

        {/* ── BOTTOM ACTION BAR (same as home page) ── */}
        <div className="relative z-10 border-t" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
          <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-center gap-3 py-4">
            <a
              href="tel:1300551350"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 text-white px-6 py-2.5 text-sm font-semibold hover:bg-brand-green hover:text-brand-navy hover:border-brand-green transition"
            >
              <Phone className="h-4 w-4" /> 1300 551 350
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-brand-green text-brand-navy px-6 py-2.5 text-sm font-semibold hover:bg-white transition"
            >
              Book a Technician
            </Link>
            <Link
              to="/service-areas"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 text-white/80 px-6 py-2.5 text-sm font-semibold hover:border-white hover:text-white transition"
            >
              <MapPin className="h-4 w-4" /> Service Areas
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4 PILLARS ─────────────────────────────────────────── */}
      <Section className="bg-white">
        <div className="container-app">
          <div className="text-center mb-10">
            <div className="w-12 h-1 bg-gradient-to-r from-brand-blue to-brand-green rounded-full mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy">
              How we help in {displayName}
            </h2>
            <p className="mt-2 text-slate-500 text-sm">Four things that make every visit worth it.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map((p) => (
              <div key={p.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-6 flex flex-col gap-3">
                <div className="h-11 w-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  {p.icon}
                </div>
                <div className="font-bold text-brand-navy text-base">{p.title}</div>
                <p className="text-sm text-slate-600 leading-relaxed flex-1">{p.text}</p>
                <span className="inline-block self-start rounded-full bg-brand-blue/10 text-brand-blue text-xs font-semibold px-3 py-1">
                  {p.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── LOCAL DESCRIPTION ─────────────────────────────────── */}
      <Section className="bg-slate-50">
        <div className="container-app max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-navy">
            Computer Repairs in {displayName}
            {postcode && <span className="text-slate-400 font-normal text-xl"> SA {postcode}</span>}
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">{longDesc}</p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Whether you are a home user whose device has stopped responding, a household in need of Wi-Fi
            help, or a local business that depends on reliable technology every day, Call-a-Technician
            is ready to visit {displayName} the same day. Our technicians arrive equipped for the most
            common repairs and aim to resolve issues in a single visit — without you needing to leave the house.
          </p>
        </div>
      </Section>

      {/* ── SERVICES ──────────────────────────────────────────── */}
      <Section>
        <div className="container-app">
          <div className="text-center mb-10">
            <div className="w-12 h-1 bg-gradient-to-r from-brand-blue to-brand-green rounded-full mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy">
              Services available in {displayName}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 flex gap-4 hover:shadow-md hover:border-brand-blue/20 transition"
              >
                <div className="shrink-0 h-12 w-12 rounded-xl bg-brand-blue/5 flex items-center justify-center text-brand-blue">
                  {s.icon}
                </div>
                <div>
                  <div className="font-semibold text-brand-navy text-sm mb-1">{s.title}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── WHY CHOOSE US ─────────────────────────────────────── */}
      <Section className="bg-slate-50">
        <div className="container-app">
          <div className="text-center mb-10">
            <div className="w-12 h-1 bg-gradient-to-r from-brand-blue to-brand-green rounded-full mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy">
              Why {displayName} residents choose us
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {WHY_COLS.map((col) => (
              <div key={col.heading} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="font-bold text-brand-navy mb-4 text-base">{col.heading}</div>
                <ul className="space-y-3">
                  {col.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-brand-green shrink-0 mt-0.5" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── BOOKING CTA ───────────────────────────────────────── */}
      <Section className="bg-brand-navy relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue to-brand-green" />
        <div className="container-app text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Need computer repairs in {displayName}?
          </h2>
          <p className="mt-3 text-white/75 text-base max-w-xl mx-auto">
            Same-day onsite support across {displayName}{postcode && ` ${postcode}`} and surrounding suburbs.
            No Fix, No Fee — you only pay when we solve the problem.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" to="/contact" className="px-8 py-3">
              Book Now in {displayName}
            </Button>
            <a
              href="tel:1300551350"
              className="rounded-md border border-white/40 text-white px-8 py-3 font-semibold hover:bg-white/10 transition text-sm inline-flex items-center justify-center gap-2"
            >
              <Phone className="h-4 w-4" />
              1300 551 350
            </a>
          </div>
        </div>
      </Section>

      {/* ── INTERACTIVE MAP ───────────────────────────────────── */}
      <Section>
        <div className="container-app">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-brand-navy">Our Adelaide Service Area</h2>
            <p className="text-slate-500 text-sm mt-1">
              We service {displayName} and 420+ suburbs across greater Adelaide.
            </p>
          </div>
          <SuburbMap currentSuburb={displayName} />
          <p className="text-center text-xs text-slate-400 mt-3">
            Hover a dot to see the suburb name &mdash; click it to visit that suburb&rsquo;s page. Drag to pan the map.
          </p>
        </div>
      </Section>

      {/* ── NEARBY SUBURBS ────────────────────────────────────── */}
      {nearbySuburbs.length > 0 && (
        <Section className="bg-slate-50">
          <div className="container-app">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-brand-navy">We Also Serve Nearby Suburbs</h2>
              <p className="text-slate-500 text-sm mt-1">
                Call-a-Technician covers {displayName} and all surrounding areas.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {nearbySuburbs.map((s) => (
                <Link
                  key={s.name}
                  to={`/computer-repairs/${toSuburbSlug(s.name)}`}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center hover:border-brand-blue hover:shadow-sm transition group"
                >
                  <div className="text-sm font-medium text-slate-800 group-hover:text-brand-blue transition">
                    {s.name}
                  </div>
                  {s.postcode && (
                    <div className="text-xs text-slate-400 mt-0.5">{s.postcode}</div>
                  )}
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link
                to="/service-areas"
                className="inline-flex items-center gap-2 text-brand-blue font-semibold hover:text-brand-navy transition text-sm"
              >
                View all 420+ service areas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}
