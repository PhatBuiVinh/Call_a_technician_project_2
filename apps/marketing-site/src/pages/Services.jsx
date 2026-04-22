import ServicesHero from "../components/sections/Services/ServicesHero";
import ServicesTabs from "../components/sections/Services/ServicesTabs";
import ProcessStrip from "../components/sections/Services/ProcessStrip";
import PricingBands from "../components/sections/Services/PricingBands";
import FAQStrip from "../components/sections/Services/FAQStrip";
import CTABand from "../components/sections/Services/CTABand";
import { SERVICE_CATEGORIES, SERVICES_BY_CATEGORY, SERVICES_FAQ } from "../data/services";
import Reveal from "../components/animation/Reveal";

export default function Services() {
  return (
    <div className="text-slate-800">
      <Reveal y={16} duration={0.45} amount={0.15}><ServicesHero /></Reveal>
      <Reveal><ServicesTabs categories={SERVICE_CATEGORIES} servicesByCategory={SERVICES_BY_CATEGORY} /></Reveal>
      <Reveal><ProcessStrip /></Reveal>
      <Reveal><PricingBands /></Reveal>
      <Reveal><FAQStrip items={SERVICES_FAQ} /></Reveal>
      <Reveal><CTABand /></Reveal>
    </div>
  );
}
