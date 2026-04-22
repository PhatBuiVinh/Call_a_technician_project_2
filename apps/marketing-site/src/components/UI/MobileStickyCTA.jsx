import { Phone, CalendarCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import Button from "../atoms/Button";

const HIDE_ON_PATHS = ["/contact", "/login"];

export default function MobileStickyCTA() {
  const location = useLocation();

  if (HIDE_ON_PATHS.some((p) => location.pathname.startsWith(p))) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[min(94vw,430px)] pointer-events-none">
      <div className="pointer-events-auto rounded-2xl border border-white/30 bg-brand-navy/95 backdrop-blur-md p-2 shadow-[0_16px_40px_rgba(0,1,84,0.35)]">
        <div className="grid grid-cols-2 gap-2">
          <Button href="tel:1300551350" variant="ghost" className="border border-white/40 text-white hover:bg-white/12 hover:text-white">
            <Phone className="h-4 w-4" />
            Call Now
          </Button>
          <Button to="/contact" variant="primary" className="justify-center">
            <CalendarCheck className="h-4 w-4" />
            Book Today
          </Button>
        </div>
      </div>
    </div>
  );
}
