import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Call-a-Technician";
const DEFAULT_TITLE = "Fast Tech Support in Adelaide";
const DEFAULT_DESCRIPTION = "Professional same-day computer repair and IT support services in Adelaide. No fix, no fee guarantee.";
const DEFAULT_IMAGE = "/assets/hero-team.jpg";

function getRouteMeta(pathname) {
  if (pathname === "/") {
    return {
      title: "Fast Tech Support in Adelaide",
      description: "Same-day computer repair and IT support for homes and businesses across Adelaide. No fix, no fee.",
      type: "website",
    };
  }

  if (pathname.startsWith("/services")) {
    return {
      title: "Computer Repair & IT Services",
      description: "Explore on-site computer repairs, Wi-Fi troubleshooting, security fixes, setup services, and business IT support.",
      type: "website",
    };
  }

  if (pathname.startsWith("/location")) {
    return {
      title: "Service Areas in Adelaide",
      description: "See all covered suburbs and service locations for same-day technician visits in Adelaide and nearby areas.",
      type: "website",
    };
  }

  if (pathname.startsWith("/blog/")) {
    return {
      title: "Tech Advice & Troubleshooting",
      description: "Read practical troubleshooting guides, cybersecurity tips, and device maintenance advice from our technicians.",
      type: "article",
    };
  }

  if (pathname.startsWith("/blog")) {
    return {
      title: "Tech Blog",
      description: "Practical IT guides, tips, and troubleshooting advice for Adelaide homes and small businesses.",
      type: "website",
    };
  }

  if (pathname.startsWith("/contact")) {
    return {
      title: "Contact & Book a Technician",
      description: "Request a call or book a same-day technician visit in Adelaide. Fast response and clear pricing.",
      type: "website",
    };
  }

  if (pathname.startsWith("/about")) {
    return {
      title: "About Call-a-Technician",
      description: "Meet the Adelaide team behind Call-a-Technician and learn why customers trust our same-day support.",
      type: "website",
    };
  }

  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    type: "website",
  };
}

function upsertMetaByAttr(attrName, attrValue, content) {
  if (!content) return;
  const selector = `meta[${attrName}="${attrValue}"]`;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attrName, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function upsertCanonical(url) {
  let tag = document.head.querySelector('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", url);
}

export default function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const meta = getRouteMeta(location.pathname);
    const title = `${meta.title} | ${SITE_NAME}`;
    const url = `${window.location.origin}${location.pathname}`;
    const imageUrl = `${window.location.origin}${DEFAULT_IMAGE}`;

    document.title = title;

    upsertMetaByAttr("name", "description", meta.description || DEFAULT_DESCRIPTION);
    upsertMetaByAttr("property", "og:site_name", SITE_NAME);
    upsertMetaByAttr("property", "og:type", meta.type || "website");
    upsertMetaByAttr("property", "og:title", title);
    upsertMetaByAttr("property", "og:description", meta.description || DEFAULT_DESCRIPTION);
    upsertMetaByAttr("property", "og:url", url);
    upsertMetaByAttr("property", "og:image", imageUrl);

    upsertMetaByAttr("name", "twitter:card", "summary_large_image");
    upsertMetaByAttr("name", "twitter:title", title);
    upsertMetaByAttr("name", "twitter:description", meta.description || DEFAULT_DESCRIPTION);
    upsertMetaByAttr("name", "twitter:image", imageUrl);

    upsertMetaByAttr("name", "robots", "index,follow");
    upsertCanonical(url);
  }, [location.pathname]);

  return null;
}
