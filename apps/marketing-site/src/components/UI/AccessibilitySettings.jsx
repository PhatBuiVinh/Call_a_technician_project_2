import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useMotionPreference } from "../../contexts/MotionPreferenceContext";

const INTENSITY_OPTIONS = [
  { value: "off", label: "Off" },
  { value: "subtle", label: "Subtle" },
  { value: "full", label: "Full" },
];

export default function AccessibilitySettings() {
  const [open, setOpen] = useState(false);
  const { motionIntensity, setMotionIntensity } = useMotionPreference();

  return (
    <div className="fixed z-50 right-4 bottom-40 md:bottom-8">
      <button
        type="button"
        aria-label="Accessibility settings"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-brand-blue/30 bg-white/95 px-3 py-2 text-sm font-medium text-brand-blue shadow-lg motion-standard hover:border-brand-blue"
      >
        {open ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
        Settings
      </button>

      {open && (
        <div className="mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_45px_rgba(2,6,23,0.18)]">
          <div className="text-sm font-semibold text-brand-navy">Accessibility Settings</div>
          <p className="mt-1 text-xs text-slate-600">
            Adjust motion to make browsing more comfortable.
          </p>

          <div className="mt-4 rounded-xl border border-slate-200 p-3">
            <div className="mb-2 text-sm text-slate-700">Animation Intensity</div>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Animation intensity">
              {INTENSITY_OPTIONS.map((option) => {
                const active = motionIntensity === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setMotionIntensity(option.value)}
                    className={`rounded-lg px-2 py-1.5 text-xs font-semibold motion-standard ${
                      active
                        ? "bg-brand-blue text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
