import { Suspense, lazy } from "react";
import Section from "../../layout/Section";
import { H2 } from "../../UI/Heading";
import { SA_MARKERS } from "../../../data/Home";       // <-- if you created it

const ServiceMap = lazy(() => import("../../maps/ServiceMap"));

export default function ServiceAreas({ suburbs }) {
  return (
    <Section muted>
      <H2>Service Areas</H2>
      <p className="section-lead">
        Same-day support across Adelaide and nearby suburbs.
      </p>

      <div className="mt-8 grid lg:grid-cols-3 gap-8 items-start">
        {/* Sidebar map (desktop) */}
        <aside className="hidden lg:block sticky top-24 self-start">
          <div className="card-soft overflow-hidden">
            <Suspense fallback={<div className="h-[360px] grid place-items-center text-slate-500 text-sm">Loading map...</div>}>
              <ServiceMap markers={SA_MARKERS} height={360} />
            </Suspense>
          </div>
          <div className="mt-4 text-sm text-slate-600">
            Unsure if we cover your area?{" "}
            <a className="underline text-brand-blue hover:text-brand-lightblue" href="tel:1300551350">
              Call 1300 551 350
            </a>
          </div>
        </aside>

        {/* SA suburbs */}
        <div className="lg:col-span-2">
          {/* Header strip */}
          <div className="card-soft p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-brand-navy/10 via-brand-blue/15 to-brand-lightblue/20 px-5 py-3 flex items-center justify-between">
              <div className="font-semibold text-brand-navy">South Australia</div>
              <span className="chip">{suburbs.length} suburbs</span>
            </div>

            <div className="px-5 py-4">
              {/* Optional quick blurb */}
              <p className="text-sm muted">
                We come to you—home or office. If you don’t see your suburb below, reach out and we’ll try to help.
              </p>

              <div className="my-4 divider" />

              {/* Multi-column brand list */}
              <ul className="text-sm muted grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 list-brand marker:text-brand-blue">
                {suburbs.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Info callout */}
          <div className="mt-6 rounded-xl border bg-brand-lightblue/10 p-4 text-sm text-slate-700">
            Can’t find your suburb? We can often help remotely or arrange a special visit.{" "}
            <a className="underline text-brand-blue hover:text-brand-lightblue" href="/contact">
              Contact us
            </a>.
          </div>
        </div>
      </div>
    </Section>
  );
}
