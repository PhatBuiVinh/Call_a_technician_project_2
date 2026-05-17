import Hero from "../components/sections/HomePage-sections/Hero";
import StatsBar from "../components/sections/HomePage-sections/StatsBar";
import ServicesGrid from "../components/sections/HomePage-sections/ServicesGrid";
import WhyUs from "../components/sections/HomePage-sections/WhyUs";
import ServiceAreasTeaser from "../components/sections/HomePage-sections/ServiceAreasTeaser";
import Testimonials from "../components/sections/HomePage-sections/Testimonials";
import { SERVICES } from "../data/Home";
import LogosCarousel from "../components/sections/HomePage-sections/LogosCarousel";
import FAQ from "../components/sections/HomePage-sections/FAQ";
import RequestCallForm from "../components/sections/HomePage-sections/RequestCallForm";

export default function Home() {
  return (
    <div className="text-slate-800">
      <Hero />
      <StatsBar />
      <LogosCarousel />
      <WhyUs />
      <ServicesGrid items={SERVICES} />
      <Testimonials />
      <FAQ />
      <ServiceAreasTeaser />
      <RequestCallForm />
    </div>
  );
}

