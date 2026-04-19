import Hero from "../components/sections/HomePage-sections/Hero";
import StatsBar from "../components/sections/HomePage-sections/StatsBar";
import ServicesGrid from "../components/sections/HomePage-sections/ServicesGrid";
import WhyUs from "../components/sections/HomePage-sections/WhyUs";
import CompanyBlurb from "../components/sections/HomePage-sections/CompanyBlurb";
import ServiceAreas from "../components/sections/HomePage-sections/ServiceAreas";
import RequestCallForm from "../components/sections/HomePage-sections/RequestCallForm";
import Testimonials from "../components/sections/HomePage-sections/Testimonials";
import { SERVICES, WHY, SUBURBS_SA } from "../data/Home";
import LogosCarousel from "../components/sections/HomePage-sections/LogosCarousel";
import FAQ from "../components/sections/HomePage-sections/FAQ";
import teamImg from "../assets/team.jpg";

export default function Home() {
  return (
    <div className="text-slate-800">
      <Hero />
      <StatsBar />
      <LogosCarousel />  {/* ✅ new trust logos strip */}
      <WhyUs items={WHY} />
      <ServicesGrid items={SERVICES} />
      <Testimonials /> {/* ✅ new testimonials carousel */}
      <FAQ /> 
      <CompanyBlurb imageUrl={teamImg} />
      <ServiceAreas suburbs={SUBURBS_SA} />
      <RequestCallForm />
    </div>
  );
}


