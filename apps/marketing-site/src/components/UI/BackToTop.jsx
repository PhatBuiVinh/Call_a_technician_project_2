import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useMotionPreference } from "../../contexts/MotionPreferenceContext";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { reduceMotion, motionIntensity } = useMotionPreference();
  const subtle = motionIntensity === "subtle";

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="backtotop"
          initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.8 }}
          animate={
            reduceMotion
              ? { opacity: 1 }
              : subtle
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 1, y: 0, scale: 1 }
          }
          exit={
            reduceMotion
              ? { opacity: 0 }
              : subtle
                ? { opacity: 0, y: 8, scale: 0.95 }
                : { opacity: 0, y: 20, scale: 0.8 }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : subtle
                ? { duration: 0.16 }
                : { duration: 0.25 }
          }
          onClick={scrollToTop}
          className="
            fixed bottom-24 right-7 z-40
            flex items-center justify-center
            w-12 h-12 rounded-full
            bg-brand-blue text-white shadow-lg
            hover:bg-brand-green hover:shadow-xl
            transition
          "
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
