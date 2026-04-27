import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { ShieldCheck, Clock3, Star, ArrowRight } from "lucide-react";
import Button from "../../atoms/Button";
import SplitRevealText from "../../animation/SplitRevealText";
import { useMotionPreference } from "../../../contexts/MotionPreferenceContext";
import HeroImageCarousel from "./HeroImageCarousel";

gsap.registerPlugin(ScrollTrigger);

export default function Hero({ imageUrl }) {
  const sectionRef = useRef(null);
  const leftColRef = useRef(null);
  const ctaRef = useRef(null);
  const trustRef = useRef(null);
  const visualRef = useRef(null);
  const imageRef = useRef(null);
  const orbARef = useRef(null);
  const orbBRef = useRef(null);
  const { reduceMotion, motionIntensity } = useMotionPreference();

  useLayoutEffect(() => {
    if (reduceMotion || !sectionRef.current) return undefined;
    const subtle = motionIntensity === "subtle";

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-hero-badge]", { opacity: 0, y: 18, duration: 0.42 })
        .from("[data-hero-heading-wrap]", { opacity: 0, y: 18, duration: 0.46 }, "-=0.2")
        .from("[data-hero-copy]", { opacity: 0, y: 16, duration: 0.4 }, "-=0.28");

      tl.from("[data-hero-footnote]", { opacity: 0, duration: 0.25 }, "-=0.12")
        .from(visualRef.current, { opacity: 0, scale: 0.96, y: 16, duration: 0.72 }, "-=0.52");

      const scrubTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: subtle ? "bottom top" : "bottom-=10% top",
          scrub: true,
        },
      });

      scrubTimeline
        .to(imageRef.current, {
          yPercent: subtle ? 8 : 14,
          scale: subtle ? 1.045 : 1.085,
          transformOrigin: "center center",
          ease: "none",
        }, 0)
        .to(visualRef.current, {
          yPercent: subtle ? -4 : -9,
          rotateX: subtle ? 0.6 : 1.4,
          transformOrigin: "center center",
          ease: "none",
        }, 0)
        .to(leftColRef.current, {
          yPercent: subtle ? -2 : -6,
          ease: "none",
        }, 0)
        .to(orbARef.current, {
          xPercent: subtle ? 4 : 10,
          yPercent: subtle ? -6 : -13,
          ease: "none",
        }, 0)
        .to(orbBRef.current, {
          xPercent: subtle ? -4 : -10,
          yPercent: subtle ? 7 : 15,
          ease: "none",
        }, 0)
        .to("[data-hero-badge]", {
          yPercent: subtle ? -4 : -10,
          opacity: subtle ? 0.93 : 0.82,
          ease: "none",
        }, 0)
        .to("[data-hero-copy]", {
          yPercent: subtle ? -5 : -12,
          opacity: subtle ? 0.95 : 0.84,
          ease: "none",
        }, 0.05)
        .to("[data-hero-footnote]", {
          opacity: subtle ? 0.78 : 0.55,
          ease: "none",
        }, 0.15);
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion, motionIntensity]);

  return (
    <section ref={sectionRef} className="section-feature relative overflow-hidden bg-gradient-to-br from-brand-blue/10 via-white to-brand-lightblue/15">
      <div className="absolute inset-0 z-0 bg-dot-grid text-brand-navy/20 mask-fade-b" />

      <div ref={orbARef} className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-brand-green/25 blur-3xl" />
      <div ref={orbBRef} className="absolute -bottom-8 -right-8 h-[32rem] w-[32rem] rounded-full bg-brand-lightblue/25 blur-3xl" />

      <div className="container-app relative z-10 grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
        <div ref={leftColRef}>
          <motion.div layoutId="shared-page-kicker" data-hero-badge className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-white/80 px-3 py-1 text-xs font-semibold text-brand-blue">
            <Star className="h-3.5 w-3.5 fill-current" />
            Rated 4.9/5 by 1,200+ Adelaide customers
          </motion.div>

          <motion.div layoutId="shared-page-headline" data-hero-heading-wrap>
            <SplitRevealText tag="h1" className="h1 mt-4 !text-5xl md:!text-7xl !leading-none" delay={0.08}>
              Same-day tech support that fixes the issue the first time
            </SplitRevealText>
          </motion.div>

          <motion.p layoutId="shared-page-copy" data-hero-copy className="mt-4 text-slate-600 text-base md:text-lg">
            Home or office, we handle computers, Wi-Fi, email, and security issues with clear pricing and no confusing jargon.
          </motion.p>

          <motion.div ref={ctaRef} data-hero-cta className="relative z-20 mt-7 flex flex-col sm:flex-row gap-3 !opacity-100">
            <Button variant="primary" to="/contact" className="min-w-52 inline-flex items-center justify-center gap-2 !opacity-100 !visible">
              Book a Technician
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="secondary" href="tel:1300551350" className="min-w-44 justify-center !opacity-100 !visible">
              Call 1300 551 350
            </Button>
          </motion.div>

          <div ref={trustRef} data-hero-trust className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="rounded-lg border border-brand-blue/20 bg-white/80 px-3 py-2 text-xs text-slate-700 inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-brand-blue" />
              Same-day availability
            </div>
            <div className="rounded-lg border border-brand-blue/20 bg-white/80 px-3 py-2 text-xs text-slate-700 inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-blue" />
              No Fix, No Fee
            </div>
            <div className="rounded-lg border border-brand-blue/20 bg-white/80 px-3 py-2 text-xs text-slate-700 inline-flex items-center gap-2">
              <Star className="h-4 w-4 text-brand-blue" />
              Local Adelaide team
            </div>
          </div>

          <p data-hero-footnote className="mt-3 text-xs text-slate-500">
            Open 7 days · Adelaide and nearby suburbs · Fast response during business hours
          </p>
        </div>

        <div
          ref={visualRef}
          className="relative overflow-hidden rounded-[32px] border border-white/60 md:h-[430px] h-[270px] flex items-center"
        >
          <HeroImageCarousel imageUrl={imageUrl} imageTrackRef={imageRef} reduceMotion={reduceMotion} />
        </div>
      </div>

      {/* Curved divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-[60px] md:h-[80px] text-white"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C480,120 960,0 1440,120 L1440,0 L0,0 Z"
            className="fill-white"
          />
        </svg>
      </div>
    </section>
  );
}
