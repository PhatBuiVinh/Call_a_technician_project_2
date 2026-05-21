import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cat_motion_intensity";
const LEGACY_KEY = "cat_reduce_motion";

const INTENSITY_VALUES = ["off", "subtle", "full"];

const MotionPreferenceContext = createContext({
  motionIntensity: "full",
  setMotionIntensity: () => {},
  reduceMotion: false,
  setReduceMotion: () => {},
});

function normalizeIntensity(value) {
  return INTENSITY_VALUES.includes(value) ? value : "full";
}

function getInitialMotionIntensity() {
  if (typeof window === "undefined") return "full";

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved) return normalizeIntensity(saved);

  const legacy = window.localStorage.getItem(LEGACY_KEY);
  if (legacy === "true") return "off";
  if (legacy === "false") return "full";

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "off" : "full";
}

export function MotionPreferenceProvider({ children }) {
  const [motionIntensity, setMotionIntensityRaw] = useState(getInitialMotionIntensity);
  const reduceMotion = motionIntensity === "off";

  const setMotionIntensity = (next) => {
    setMotionIntensityRaw((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      return normalizeIntensity(value);
    });
  };

  const setReduceMotion = (next) => {
    if (typeof next === "function") {
      setMotionIntensityRaw((prev) => {
        const shouldReduce = next(prev === "off");
        return shouldReduce ? "off" : "full";
      });
      return;
    }

    setMotionIntensityRaw(next ? "off" : "full");
  };

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, motionIntensity);
    window.localStorage.setItem(LEGACY_KEY, String(reduceMotion));
    document.documentElement.dataset.motion = motionIntensity;
  }, [motionIntensity, reduceMotion]);

  const value = useMemo(
    () => ({ motionIntensity, setMotionIntensity, reduceMotion, setReduceMotion }),
    [motionIntensity, reduceMotion]
  );

  return (
    <MotionPreferenceContext.Provider value={value}>
      {children}
    </MotionPreferenceContext.Provider>
  );
}

/* eslint-disable-next-line react-refresh/only-export-components */
export function useMotionPreference() {
  return useContext(MotionPreferenceContext);
}
