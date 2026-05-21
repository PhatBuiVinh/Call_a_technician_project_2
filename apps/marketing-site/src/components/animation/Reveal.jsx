import { motion } from "framer-motion";
import { useMotionPreference } from "../../contexts/MotionPreferenceContext";

export default function Reveal({
  children,
  className = "",
  delay = 0,
  y = 22,
  duration = 0.5,
  once = true,
  amount = 0.25,
}) {
  const { reduceMotion, motionIntensity } = useMotionPreference();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const subtle = motionIntensity === "subtle";
  const finalY = subtle ? Math.round(y * 0.45) : y;
  const finalDuration = subtle ? Math.max(0.2, duration * 0.72) : duration;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: finalY }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: finalDuration, delay, ease: [0.2, 0.65, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}