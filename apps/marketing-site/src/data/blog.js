// You can replace this with API data later.
import blogDemoImage from "../assets/blog/blogdemo.jpg";

export const CATEGORIES = ["Tips", "Troubleshooting", "Security", "Wi-Fi", "Business IT"];

export const POSTS = [
  {
    id: "speed-up-windows",
    title: "10 Ways to Speed Up a Slow Windows PC",
    excerpt: "From startup apps to storage health—quick wins you can do today.",
    category: "Tips",
    author: "Alex T.",
    date: "2025-08-02",
    readMins: 6,
    image: blogDemoImage,
    featured: true,
    content: [
      { type: "p", text: "A slow Windows PC is usually a mix of startup apps, background processes, and storage issues. Here are practical steps you can do today without buying new hardware." },
      { type: "h2", text: "1) Check startup apps" },
      { type: "p", text: "Open Task Manager → Startup Apps. Disable anything you don’t need launching at boot (Spotify, game launchers, etc.)." },
      { type: "h2", text: "2) Storage health & free space" },
      { type: "p", text: "Keep at least 15% free space on your system drive and run ‘Storage Sense’. If the drive is failing, replace with an SSD." },
      { type: "ul", items: [
        "Run Windows Update",
        "Remove old antivirus if you switched",
        "Update graphics and chipset drivers"
      ]},
      { type: "quote", text: "Rule of thumb: if your boot drive is a HDD, upgrading to SSD gives the single biggest speed boost." },
      { type: "p", text: "Book a technician if you’d like us to assess thermals and replace a drive while migrating your data safely." }
    ],
  },
  {
    id: "wifi-dropouts",
    title: "Fixing Wi-Fi Dropouts at Home: A Simple Checklist",
    excerpt: "Placement, channels, mesh—what actually matters and what doesn’t.",
    category: "Wi-Fi",
    author: "Sam R.",
    date: "2025-07-18",
    readMins: 5,
    image: blogDemoImage,
    content: [
      { type: "p", text: "Wi-Fi dropouts are usually caused by poor placement, interference, or an overworked router. Follow this checklist to stabilise your network." },
      { type: "h2", text: "1) Router placement" },
      { type: "p", text: "Place the router high, central, off the floor. Avoid cupboards and metal cabinets." },
      { type: "h2", text: "2) Channel selection" },
      { type: "p", text: "Use auto or pick a quiet channel. For 2.4 GHz use 1/6/11; for 5 GHz leave on auto unless congested." },
      { type: "ul", items: [
        "Separate guest network",
        "Update router firmware",
        "Consider mesh for multi-storey homes"
      ]},
      { type: "p", text: "If you still see dropouts, it’s likely coverage or interference. A mesh system usually solves it." }
    ],
  },
  {
    id: "backups-101",
    title: "Backups 101: The 3-2-1 Rule Explained",
    excerpt: "Never lose photos again. Set up a backup the right way.",
    category: "Security",
    author: "Casey M.",
    date: "2025-06-11",
    readMins: 4,
    image: blogDemoImage,
  },
  {
    id: "email-hacked",
    title: "Email Hacked? Here’s the 20-Minute Recovery Plan",
    excerpt: "Regain access, lock it down, and prevent it happening again.",
    category: "Security",
    author: "Alex T.",
    date: "2025-05-28",
    readMins: 7,
    image: blogDemoImage,
  },
  {
    id: "small-biz-it-starter",
    title: "Small Business IT: A Starter Kit",
    excerpt: "5 things every small team should do to stay secure and sane.",
    category: "Business IT",
    author: "Sam R.",
    date: "2025-05-05",
    readMins: 6,
    image: blogDemoImage,
  },
  {
    id: "mac-maintenance",
    title: "Mac Maintenance: The Once-a-Month Tune-Up",
    excerpt: "Keep macOS happy with these simple routines.",
    category: "Tips",
    author: "Casey M.",
    date: "2025-04-14",
    readMins: 4,
    image: blogDemoImage,
  },
];