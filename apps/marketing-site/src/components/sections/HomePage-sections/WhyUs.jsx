import { motion } from "framer-motion";
import { CheckCircle, MinusCircle } from "lucide-react";
import Section from "../../layout/Section";
import { H2 } from "../../ui/Heading";

export default function WhyUs() {
  return (
    <Section muted>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-[3px] bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green rounded-full mx-auto" />
            <H2 className="mt-4">Why Choose Call-a-Technician</H2>
            <p className="mt-2 text-slate-600">
              A transparent comparison with common alternatives.
            </p>
          </div>

          {/* Responsive matrix */}
          <div className="relative mt-8 rounded-xl border bg-white overflow-x-auto shadow-lg">
            <div className="absolute top-2 right-4 text-xs text-slate-400 md:hidden">
              ← scroll →
            </div>
            <table className="min-w-[720px] w-full border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-left text-sm text-slate-600">
                  <th className="p-4 font-medium"></th>
                  <th className="p-4 font-bold bg-brand-navy text-white rounded-t-lg">Call-a-Technician</th>
                  <th className="p-4 font-medium">Big-box Repair Counter</th>
                  <th className="p-4 font-medium">Remote-only Service</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {ROWS.map((r, idx) => (
                  <tr
                    key={r.label}
                    className={`transition ${idx % 2 ? "bg-slate-50/60" : ""} hover:bg-amber-50`}
                  >
                    <th className="p-4 font-medium text-brand-navy align-top w-[38%]">
                      {r.label}
                      {r.note && (
                        <div className="text-xs text-slate-500 mt-1">{r.note}</div>
                      )}
                    </th>
                    <td className="p-4 font-bold align-top bg-brand-navy/10 border-l-4 border-brand-navy">{renderCell(r.us)}</td>
                    <td className="p-4 align-top text-slate-700">{renderCell(r.counter)}</td>
                    <td className="p-4 align-top text-slate-700">{renderCell(r.remote)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Credibility line */}
          <div className="mt-6 rounded-lg border bg-brand-lightblue/10 p-4 text-sm text-slate-700 text-center">
            Rated <span className="font-semibold text-brand-navy">4.9/5</span> by 1,200+ customers {" "}
                   
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

/* ---------- Data & helpers (same file for now; move to /data later) ---------- */

const ROWS = [
  {
    label: "Same-day on-site help",
    us: "✓ Same-day in Adelaide & nearby suburbs",
    counter: "Usually queue; 2-7 days",
    remote: "✓ Immediate (if issue is software-only)",
  },
  {
    label: "No Fix, No Fee",
    us: "✓ If we can’t resolve it, you don’t pay",
    counter: "Diagnostics fee applies",
    remote: "Limited*",
    note: "Parts/special orders excluded if you decline proceeding.",
  },
  {
    label: "Transparent pricing",
    us: "✓ Clear estimate before work begins",
    counter: "Variable; add-ons at counter",
    remote: "Hourly blocks / subscriptions",
  },
  {
    label: "In-home Wi-Fi & network issues",
    us: "✓ Mesh setup, coverage tests, onsite fixes",
    counter: "— In-store only",
    remote: "— Physical issues not possible",
  },
  {
    label: "Hardware repairs & upgrades",
    us: "✓ Diagnosis + parts replacement",
    counter: "✓ Often available; may require check-in",
    remote: "— Not applicable",
  },
  {
    label: "Data privacy & handling",
    us: "✓ Work done in front of you, on-site",
    counter: "Device left in store",
    remote: "✓ No device leaves home (software only)",
  },
  {
    label: "Aftercare & documentation",
    us: "✓ Summary + simple next steps",
    counter: "Receipt with brief notes",
    remote: "Email transcript / notes",
  },
];

function renderCell(value) {
  if (value === "✓" || value === true) {
    return (
      <span className="inline-flex items-center gap-2 text-brand-navy">
        <CheckCircle className="text-emerald-500 w-4 h-4" />
        Included
      </span>
    );
  }
  if (value === "—" || value === false) {
    return <MinusCircle className="text-slate-400 w-4 h-4" />;
  }
  return <span>{value}</span>;
}
