import { Phone, CalendarCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import Button from "../atoms/Button";

const HIDE_ON_PATHS = ["/contact"];

export default function MobileStickyCTA() {
  const location = useLocation();

  if (HIDE_ON_PATHS.some((p) => location.pathname.startsWith(p))) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[min(94vw,430px)] pointer-events-none">
      <div className="pointer-events-auto rounded-[32px] border border-white/25 bg-brand-navy/95 backdrop-blur-md p-3">
        <div className="grid gap-2">
          <Button to="/contact" variant="primary" className="w-full justify-center py-3 text-base font-semibold">
            <CalendarCheck className="h-4 w-4" />
            Contact Us
          </Button>
          <Button href="tel:1300551350" variant="ghost" className="w-full justify-center border border-white/35 text-white hover:bg-white/12 hover:text-white">
            <Phone className="h-4 w-4" />
            Call Now
          </Button>
        </div>
      </div>
    </div>
  );
}
