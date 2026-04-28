import {
  Bug, ShieldCheck, Cpu, Wifi, HardDrive, Wrench,
  Cloud, Lock, MonitorUp, Network
} from "lucide-react";

export const SERVICE_CATEGORIES = [
  { id: "home", label: "Home" },
  { id: "business", label: "Business" },
  { id: "network", label: "Wi-Fi & Network" },
  { id: "security", label: "Security" },
];

export const SERVICES_BY_CATEGORY = {
  home: [
    {
      icon: Bug,
      title: "Virus & Malware Removal",
      blurb: "Identify, remove and secure against threats.",
      bullets: ["Full scan & cleanup", "Browser hijack fixes", "Protection setup"],
      image: "/images/services/service-virus-removal-01.png",
      imageAlt: "Technician removing malware from a desktop computer",
      price: "from $99",
      href: "/contact",
    },
    {
      icon: Cpu,
      title: "Speed Up Slow Computers",
      blurb: "Performance tune-up for Windows & macOS.",
      bullets: ["Startup optimisation", "App cleanup", "Thermal checks"],
      image: "/images/services/service-laptop-speedup-01.png",
      imageAlt: "Laptop performance tune-up and diagnostics",
      price: "from $89",
      href: "/contact",
    },
    {
      icon: MonitorUp,
      title: "New PC & Device Setup",
      blurb: "Unbox, migrate and configure everything right.",
      bullets: ["Data transfer", "Printer setup", "Email & apps"],
      image: "/images/services/service-new-device-setup-01.png",
      imageAlt: "Technician setting up a new computer for a customer",
      price: "from $109",
      href: "/contact",
    },
    {
      icon: HardDrive,
      title: "Backup & Data Recovery",
      blurb: "Protect files and recover when possible.",
      bullets: ["Backup plan", "External & cloud", "Attempted recovery"],
      image: "/images/services/service-data-recovery-01.png",
      imageAlt: "Data recovery process with backup devices",
      price: "from $129",
      href: "/contact",
    },
  ],
  business: [
    {
      icon: Network,
      title: "Business IT Support",
      blurb: "On-call help for small offices and teams.",
      bullets: ["Onsite & remote", "Networking/servers", "Security basics"],
      image: "/images/services/service-business-it-support-01.png",
      imageAlt: "On-site business IT support at office workspace",
      price: "plans available",
      href: "/contact",
    },
    {
      icon: Cloud,
      title: "Cloud & Email Setup",
      blurb: "Microsoft 365 / Google Workspace done right.",
      bullets: ["Domains & mail", "Calendar/contacts", "Drive/OneDrive"],
      image: "/images/services/service-cloud-email-setup-01.png",
      imageAlt: "Cloud email setup and account configuration",
      price: "from $129",
      href: "/contact",
    },
  ],
  network: [
    {
      icon: Wifi,
      title: "Wi-Fi & Coverage Fix",
      blurb: "Fix dropouts, extend coverage, secure your network.",
      bullets: ["Mesh setup", "Speed & coverage test", "Guest network"],
      image: "/images/services/service-home-wifi-repair-01.png",
      imageAlt: "Technician testing and improving home Wi-Fi coverage",
      price: "from $129",
      href: "/contact",
    },
    {
      icon: Wrench,
      title: "Network Hardware Install",
      blurb: "Routers, switches, cabling, tidy & label.",
      bullets: ["Placement & mounting", "Config & testing", "Documentation"],
      image: "/images/services/service-network-install-01.png",
      imageAlt: "Router and network hardware installation service",
      price: "quote",
      href: "/contact",
    },
  ],
  security: [
    {
      icon: ShieldCheck,
      title: "Secure Hacked Devices",
      blurb: "Recover compromised accounts & devices safely.",
      bullets: ["Account recovery", "2FA setup", "Ongoing security tips"],
      image: "/images/services/service-security-hardening-01.png",
      imageAlt: "Account recovery and device security remediation",
      price: "from $119",
      href: "/contact",
    },
    {
      icon: Lock,
      title: "Security Hardening",
      blurb: "MFA, password managers, backup + update strategy.",
      bullets: ["Audit & quick wins", "Best-practice setup", "Follow-up report"],
      image: "/images/services/service-security-audit-01.png",
      imageAlt: "Security hardening audit on workstation",
      price: "from $149",
      href: "/contact",
    },
  ],
};

// Small FAQ for the page
export const SERVICES_FAQ = [
  {
    q: "Do you charge a call-out fee?",
    a: "No separate call-out fee. We quote up-front before work begins. If we can’t fix it, you don’t pay.",
  },
  {
    q: "Do you offer same-day service?",
    a: "Yes—same-day in Adelaide & nearby suburbs, subject to availability. Call early for best choice of times.",
  },
  {
    q: "Is my data safe?",
    a: "We work in front of you where possible. Backup and privacy are always part of the conversation.",
  },
];
