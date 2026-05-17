import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ServicesHero from "../components/sections/Services/ServicesHero";
import ServicesTabs from "../components/sections/Services/ServicesTabs";
import ProcessStrip from "../components/sections/Services/ProcessStrip";
import PricingBands from "../components/sections/Services/PricingBands";
import FAQStrip from "../components/sections/Services/FAQStrip";
import CTABand from "../components/sections/Services/CTABand";
import { SERVICE_CATEGORIES, SERVICES_BY_CATEGORY, SERVICES_FAQ } from "../data/services";

export default function Services() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [hash]);

  return (
    <div className="text-slate-800">
      <ServicesHero />
      <ServicesTabs categories={SERVICE_CATEGORIES} servicesByCategory={SERVICES_BY_CATEGORY} />
      <ProcessStrip />
      <PricingBands />
      <FAQStrip items={SERVICES_FAQ} />
      <CTABand />
    </div>
  );
}
