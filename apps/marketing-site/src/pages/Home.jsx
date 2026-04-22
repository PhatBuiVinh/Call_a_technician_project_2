import Hero from "../components/sections/HomePage-sections/Hero";
import StatsBar from "../components/sections/HomePage-sections/StatsBar";
import CompanyBlurb from "../components/sections/HomePage-sections/CompanyBlurb";
import ServiceAreas from "../components/sections/HomePage-sections/ServiceAreas";
import RequestCallForm from "../components/sections/HomePage-sections/RequestCallForm";
import { SERVICES, SUBURBS_SA } from "../data/Home";
import LogosCarousel from "../components/sections/HomePage-sections/LogosCarousel";
import FAQ from "../components/sections/HomePage-sections/FAQ";
import teamImg from "../assets/team.jpg";
import Reveal from "../components/animation/Reveal";
import HomeStoryFlow from "../components/sections/HomePage-sections/HomeStoryFlow";

export default function Home() {
  return (
    <div className="text-slate-800">
      <Reveal y={16} duration={0.45} amount={0.15}><Hero /></Reveal>
      <Reveal delay={0.02}><StatsBar /></Reveal>
      <Reveal delay={0.02}><LogosCarousel /></Reveal>
      <Reveal><HomeStoryFlow services={SERVICES} /></Reveal>
      <Reveal><FAQ /></Reveal>
      <Reveal><CompanyBlurb imageUrl={teamImg} /></Reveal>
      <Reveal><ServiceAreas suburbs={SUBURBS_SA} /></Reveal>
      <Reveal><RequestCallForm /></Reveal>
    </div>
  );
}


