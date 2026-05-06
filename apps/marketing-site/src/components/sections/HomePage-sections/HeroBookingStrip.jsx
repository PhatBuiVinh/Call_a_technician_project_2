import { Phone, PhoneIncoming, CalendarCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroBookingStrip() {
  const actions = [
    {
      icon: Phone,
      label: "Call 1300 551 350",
      href: "tel:1300551350",
      variant: "primary",
      description: "Speak with a technician now",
    },
    {
      icon: PhoneIncoming,
      label: "Request Call Back",
      href: "/contact",
      variant: "secondary",
      description: "We'll call you back within 30 minutes",
    },
    {
      icon: CalendarCheck,
      label: "Request Service",
      href: "/contact",
      variant: "tertiary",
      description: "Send us your details",
    },
  ];

  return (
    <div className="relative z-30 -mt-10 md:-mt-14 lg:-mt-16">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-3xl border border-white/70 bg-white/95 backdrop-blur-md shadow-2xl shadow-brand-navy/20 p-4 md:p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {actions.map((action, index) => (
              <motion.a
                key={action.label}
                href={action.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                className={`
                  group relative overflow-hidden rounded-2xl border p-4 md:p-5 transition-all duration-300
                  ${
                    action.variant === "primary"
                      ? "border-brand-green/50 bg-gradient-to-br from-brand-green/10 to-brand-green/5 hover:border-brand-green hover:shadow-lg hover:shadow-brand-green/20"
                      : action.variant === "secondary"
                      ? "border-brand-blue/50 bg-gradient-to-br from-brand-blue/10 to-brand-blue/5 hover:border-brand-blue hover:shadow-lg hover:shadow-brand-blue/20"
                      : "border-slate-200/60 bg-gradient-to-br from-slate-50 to-white hover:border-brand-lightblue hover:shadow-lg hover:shadow-brand-lightblue/20"
                  }
                `}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div
                    className={`
                      flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors
                      ${
                        action.variant === "primary"
                          ? "bg-brand-green text-white"
                          : action.variant === "secondary"
                          ? "bg-brand-blue text-white"
                          : "bg-brand-lightblue/20 text-brand-blue"
                      }
                    `}
                  >
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`
                        font-semibold transition-colors
                        ${
                          action.variant === "primary"
                            ? "text-brand-navy group-hover:text-brand-green"
                            : "text-brand-navy group-hover:text-brand-blue"
                        }
                      `}
                    >
                      {action.label}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-600 line-clamp-1">
                      {action.description}
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
