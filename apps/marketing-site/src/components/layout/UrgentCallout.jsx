import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X } from "lucide-react";
import Button from "../atoms/Button";

/**
 * Floating ribbon (light surface) that sits under the fixed NavBar.
 * - White/glass interior (NOT navy), brand text, gradient border
 * - Centered, rounded-2xl, shadow, subtle animation
 * - Dismiss (no persistence by default)
 */
export default function UrgentCallout({ persist = "none" }) {
  const KEY = "urgent_callout_dismissed_ts";
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (persist === "none") { setOpen(true); return; }
    const ts = (persist === "session")
      ? sessionStorage.getItem(KEY)
      : localStorage.getItem(KEY);
    if (!ts) { setOpen(true); return; }
    if (persist === "day") {
      const age = Date.now() - Number(ts);
      setOpen(age > 24 * 60 * 60 * 1000);
    } else {
      setOpen(false);
    }
  }, [persist]);

  const dismiss = () => {
    if (persist === "session") sessionStorage.setItem(KEY, String(Date.now()));
    if (persist === "day") localStorage.setItem(KEY, String(Date.now()));
    setOpen(false);
  };

return (
    <AnimatePresence>
        {open && (
            <motion.div
                key="urgent-floating"
                initial={{ y: -18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="fixed inset-x-0 top-[78px] md:top-[86px] px-3 mx-auto flex justify-center z-40"
                role="region"
                aria-label="Urgent assistance"
            >
                <div className="w-[min(94vw,940px)] rounded-[32px] bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green p-[1.5px]">
                    <div className="relative rounded-[32px] bg-white/90 backdrop-blur-md text-brand-navy">
                        <div className="px-4 sm:px-6 py-3.5 flex flex-wrap md:flex-nowrap items-center gap-3">
                            <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-brand-lightblue/25 text-brand-blue">
                                <Phone className="w-4 h-4" />
                            </div>

                            <p className="text-sm md:text-[15px] leading-6 flex-1 min-w-[210px]">
                                <span className="font-semibold">Need urgent help today?</span>{" "}
                                Book a same-day technician in Adelaide.
                            </p>

                            <div className="flex items-center gap-2 ml-auto">
                                <a
                                    href="tel:1300551350"
                                    className="hidden sm:inline-flex min-h-11 items-center rounded-xl border border-brand-blue/40 px-3 py-1.5 text-sm text-brand-blue transition hover:border-brand-blue"
                                >
                                    Call 1300 551 350
                                </a>
                                <a
                                    href="tel:1300551350"
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-brand-blue/40 text-brand-blue sm:hidden"
                                    aria-label="Call now"
                                >
                                    <Phone className="h-4 w-4" />
                                </a>
                                <Button
                                    variant="primary"
                                    className="px-3 py-1.5 text-sm"
                                    to="/contact"
                                >
                                    Book Now
                                </Button>
                                <button
                                    aria-label="Dismiss"
                                    onClick={dismiss}
                                    className="ml-1 rounded-xl p-2 hover:bg-black/5"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);
}
