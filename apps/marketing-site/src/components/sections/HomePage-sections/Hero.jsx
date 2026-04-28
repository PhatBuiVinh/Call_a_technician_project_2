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
    <section ref={sectionRef} className="section-feature relative overflow-hidden bg-brand-navy pb-24 md:pb-28 lg:pb-32">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy" />
        <div className="absolute inset-0 bg-dot-grid text-white/10" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-brand-navy" />
      </div>

      <div ref={orbARef} className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-brand-green/20 blur-3xl md:h-96 md:w-96" />
      <div ref={orbBRef} className="pointer-events-none absolute -bottom-16 -right-10 h-80 w-80 rounded-full bg-brand-lightblue/20 blur-3xl md:h-[24rem] md:w-[24rem]" />

      <div className="container-app relative z-10 pb-8 md:pb-12">
        <div className="relative overflow-hidden rounded-[30px] border border-white/20 bg-brand-navy/35 shadow-[0_30px_80px_rgba(0,1,84,0.45)] lg:h-[620px] xl:h-[680px]">
          <div
            ref={visualRef}
            className="relative z-10 h-[320px] sm:h-[380px] md:h-[440px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-[620px] lg:w-[54%] xl:h-[680px]"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-brand-navy/20 via-transparent to-brand-navy/55" />
            <HeroImageCarousel
              imageUrl={imageUrl}
              imageTrackRef={imageRef}
              reduceMotion={reduceMotion}
              className="h-full w-full lg:rounded-none"
            />
          </div>

          <div
            ref={leftColRef}
            className="relative z-20 bg-gradient-to-br from-brand-navy via-brand-blue to-brand-navy px-6 py-9 sm:px-8 sm:py-10 md:px-10 md:py-12 lg:h-[620px] lg:w-[52%] lg:-mr-14 lg:rounded-r-[180px] lg:px-12 lg:py-14 xl:h-[680px] xl:rounded-r-[230px]"
          >
            <div className="max-w-2xl xl:max-w-3xl">
              <motion.div layoutId="shared-page-kicker" data-hero-badge className="inline-flex items-center gap-2 rounded-full border border-brand-green/35 bg-brand-green/15 px-3 py-1 text-xs font-semibold text-brand-green">
                <Star className="h-3.5 w-3.5 fill-current" />
                Rated 4.9/5 by 1,200+ Adelaide customers
              </motion.div>

              <motion.div layoutId="shared-page-headline" data-hero-heading-wrap>
                <SplitRevealText tag="h1" className="h1 mt-4 !text-5xl !leading-[0.98] !text-white md:!text-6xl xl:!text-7xl" delay={0.08}>
                  Same-day tech support that fixes the issue the first time
                </SplitRevealText>
              </motion.div>

              <motion.p layoutId="shared-page-copy" data-hero-copy className="mt-4 max-w-2xl text-base text-white/85 md:text-lg">
                Home or office, we handle computers, Wi-Fi, email, and security issues with clear pricing and no confusing jargon.
              </motion.p>

              <motion.div ref={ctaRef} data-hero-cta className="relative z-20 mt-7 flex flex-col gap-3 !opacity-100 sm:flex-row">
                <Button variant="primary" to="/contact" className="min-w-52 inline-flex items-center justify-center gap-2 !opacity-100 !visible">
                  Book a Technician
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="secondary" href="tel:1300551350" className="min-w-44 justify-center !opacity-100 !visible !border-white/30 !bg-white/10 !text-white hover:!bg-white/20">
                  Call 1300 551 350
                </Button>
              </motion.div>

              <div ref={trustRef} data-hero-trust className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white/90">
                  <Clock3 className="h-4 w-4 text-brand-green" />
                  Same-day availability
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white/90">
                  <ShieldCheck className="h-4 w-4 text-brand-green" />
                  No Fix, No Fee
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white/90">
                  <Star className="h-4 w-4 text-brand-green" />
                  Local Adelaide team
                </div>
              </div>

              <p data-hero-footnote className="mt-3 text-xs text-white/65">
                Open 7 days · Adelaide and nearby suburbs · Fast response during business hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
