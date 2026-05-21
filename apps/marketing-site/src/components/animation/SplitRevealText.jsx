import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import SplitType from "split-type";
import { useMotionPreference } from "../../contexts/MotionPreferenceContext";

export default function SplitRevealText({
  children,
  className = "",
  tag = "h1",
  delay = 0,
}) {
  const Component = tag;
  const ref = useRef(null);
  const { reduceMotion, motionIntensity } = useMotionPreference();

  useLayoutEffect(() => {
    if (!ref.current) return undefined;
    if (reduceMotion) return undefined;

    const subtle = motionIntensity === "subtle";

    const split = new SplitType(ref.current, {
      types: subtle ? "words" : "chars, words",
      tagName: "span",
    });

    const targets = subtle ? (split.words || []) : (split.chars || []);
    if (!targets.length) {
      split.revert();
      return undefined;
    }

    gsap.set(targets, {
      yPercent: 110,
      opacity: 0,
      display: "inline-block",
      willChange: "transform, opacity",
    });

    const tween = gsap.to(targets, {
      yPercent: 0,
      opacity: 1,
      duration: subtle ? 0.5 : 0.72,
      stagger: subtle ? 0.028 : 0.012,
      delay,
      ease: "power3.out",
    });

    return () => {
      tween.kill();
      split.revert();
    };
  }, [children, delay, reduceMotion, motionIntensity]);

  return <Component ref={ref} className={className}>{children}</Component>;
}