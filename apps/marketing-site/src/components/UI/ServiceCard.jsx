import fallbackImage from "../../assets/tech-visit.jpg";

const getNextImageFallback = (src = "") => {
  if (/\.webp(?=($|\?))/i.test(src)) {
    return src.replace(/\.webp(?=($|\?))/i, ".png");
  }
  if (/\.png(?=($|\?))/i.test(src)) {
    return src.replace(/\.png(?=($|\?))/i, ".jpg");
  }
  return null;
};

export default function ServiceCard({ icon: Icon, title, blurb, bullets = [], price, href, image, imageAlt }) {
  return (
    <a
      href={href || "/contact"}
      className="group block rounded-[32px] border border-slate-200/50 bg-white p-6 transition-transform duration-200 motion-safe:hover:-translate-y-1 hover:border-brand-blue/35 focus-brand"
    >
      <div className="mb-4 h-40 w-full overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={image || fallbackImage}
          alt={imageAlt || title}
          loading="lazy"
          onError={(e) => {
            const nextSrc = getNextImageFallback(e.currentTarget.getAttribute("src") || "");
            if (nextSrc) {
              e.currentTarget.setAttribute("src", nextSrc);
              return;
            }

            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImage;
          }}
          className="h-full w-full object-cover motion-standard motion-safe:group-hover:scale-105"
        />
      </div>
      <div className="h-1 w-12 bg-gradient-to-r from-brand-blue to-brand-lightblue rounded-full" />
      <div className="mt-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-md bg-brand-lightblue/30 text-brand-blue grid place-items-center shrink-0">
          {Icon ? <Icon className="w-5 h-5" /> : <span className="text-lg">🛠️</span>}
        </div>
        <div className="min-w-0">
          <div className="text-xl md:text-2xl font-semibold text-brand-navy">{title}</div>
          <p className="mt-1 text-sm text-slate-600">{blurb}</p>
          {bullets.length > 0 && (
            <ul className="mt-2 text-sm text-slate-600 space-y-1 list-disc list-inside">
              {bullets.slice(0,3).map((b) => <li key={b}>{b}</li>)}
            </ul>
          )}
          <div className="mt-4 flex items-center justify-between">
            <span className="chip">
              {price || "from $99"}
            </span>
            <span className="text-sm font-medium text-brand-blue group-hover:text-brand-lightblue">Get help →</span>
          </div>
        </div>
      </div>
    </a>
  );
}
