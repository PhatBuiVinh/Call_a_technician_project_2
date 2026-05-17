import { Tab } from "@headlessui/react";
import Section from "../../layout/Section";
import ServiceCard from "../../UI/ServiceCard";

function cls(...xs) { return xs.filter(Boolean).join(" "); }

export default function ServicesTabs({ categories, servicesByCategory }) {
  return (
    <Section>
      <div className="container-app">
        <Tab.Group>
          <Tab.List className="flex flex-wrap gap-2 rounded-xl border bg-white p-2">
            {categories.map((c) => (
              <Tab key={c.id}
                className={({ selected }) =>
                  cls(
                    "px-3 py-1.5 text-sm rounded-md focus:outline-none",
                    selected
                      ? "bg-brand-blue text-white"
                      : "hover:bg-slate-100 text-brand-navy"
                  )
                }
              >
                {c.label}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="mt-6">
            {categories.map((c) => (
              <Tab.Panel key={c.id}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(servicesByCategory[c.id] || []).map((s) => (
                    <ServiceCard key={s.title} {...s} />
                  ))}
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>

        {/* reassurance band */}
        <div className="mt-8 rounded-xl border bg-brand-lightblue/10 p-4 text-sm text-slate-700 text-center">
          Can’t see your exact issue? Describe it on our{" "}
          <a href="/contact" className="underline text-brand-blue hover:text-brand-lightblue">
            contact form
          </a>{" "}
          or call <a className="underline" href="tel:1300551350">1300 551 350</a>.
        </div>
      </div>
    </Section>
  );
}
