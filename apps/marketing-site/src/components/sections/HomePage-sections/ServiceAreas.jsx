import { Suspense, lazy } from "react";
import Section from "../../layout/Section";
import { H2 } from "../../UI/Heading";
import { SA_MARKERS } from "../../../data/Home";       // <-- if you created it

const ServiceMap = lazy(() => import("../../maps/ServiceMap"));

export default function ServiceAreas({ suburbs }) {
  return (
    <section className="bg-brand-navy">
      <Section className="text-white" size="lg">
      <H2 className="!text-white">Service Areas</H2>
      <p className="section-lead text-white/80">
        Same-day support across Adelaide and nearby suburbs.
      </p>

      <div className="mt-8 grid lg:grid-cols-3 gap-8 items-start">
        {/* Sidebar map (desktop) */}
        <aside className="hidden lg:block sticky top-24 self-start">
          <div className="card-soft rounded-[32px] overflow-hidden border-white/20 bg-white/10">
            <Suspense fallback={<div className="skeleton-block h-[360px] grid place-items-center text-white/70 text-sm">Loading map...</div>}>
              <ServiceMap markers={SA_MARKERS} height={360} />
            </Suspense>
          </div>
          <div className="mt-4 text-sm text-white/80">
            Unsure if we cover your area?{" "}
            <a className="link-animated-dark text-brand-lightblue hover:text-brand-green" href="tel:1300551350">
              Call 1300 551 350
            </a>
          </div>
        </aside>

        {/* SA suburbs */}
        <div className="lg:col-span-2">
          {/* Header strip */}
          <div className="card-soft rounded-[32px] border-white/20 bg-white/10 p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-brand-blue/35 via-brand-blue/25 to-brand-lightblue/30 px-5 py-3 flex items-center justify-between">
              <div className="font-semibold text-white">South Australia</div>
              <span className="chip !bg-white/15 !text-white !border-white/30">{suburbs.length} suburbs</span>
            </div>

            <div className="px-5 py-4">
              {/* Optional quick blurb */}
              <p className="text-sm text-white/80">
                We come to you—home or office. If you don’t see your suburb below, reach out and we’ll try to help.
              </p>

              <div className="my-4 h-px bg-white/20" />

              {/* Multi-column brand list */}
              <ul className="grid list-brand gap-x-6 gap-y-1 text-sm text-white/85 marker:text-brand-lightblue sm:grid-cols-2 lg:grid-cols-3">
                {suburbs.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Info callout */}
          <div className="mt-6 rounded-[32px] border border-white/20 bg-white/10 p-4 text-sm text-white/85">
            Can’t find your suburb? We can often help remotely or arrange a special visit.{" "}
            <a className="link-animated-dark text-brand-lightblue hover:text-brand-green" href="/contact">
              Contact us
            </a>.
          </div>
        </div>
      </div>
      </Section>
    </section>
  );
}
