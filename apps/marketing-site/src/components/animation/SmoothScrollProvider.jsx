import { useEffect } from "react";
import Lenis from "lenis";
import { useMotionPreference } from "../../contexts/MotionPreferenceContext";

export default function SmoothScrollProvider({ children }) {
  const { reduceMotion, motionIntensity } = useMotionPreference();

  useEffect(() => {
    if (reduceMotion) return undefined;

    const subtle = motionIntensity === "subtle";

    const lenis = new Lenis({
      duration: subtle ? 0.75 : 1,
      smoothWheel: true,
      wheelMultiplier: subtle ? 0.88 : 0.95,
      touchMultiplier: subtle ? 1.05 : 1.15,
      lerp: subtle ? 0.1 : 0.12,
    });

    let frameId = 0;

    const raf = (time) => {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(raf);
    };

    frameId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [reduceMotion, motionIntensity]);

  return children;
}