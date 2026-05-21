export default function ServiceCard({ icon: Icon, title, blurb, bullets = [], href }) {
  return (
    <a href={href || "/contact"} className="group block rounded-xl border bg-white p-5 hover:shadow-lg hover:-translate-y-[2px] transition focus:outline-none focus:ring-2 focus:ring-brand-lightblue/60">
      <div className="h-1 w-12 bg-gradient-to-r from-brand-blue to-brand-lightblue rounded-full" />
      <div className="mt-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-md bg-brand-lightblue/30 text-brand-blue grid place-items-center shrink-0">
          {Icon ? <Icon className="w-5 h-5" /> : <span className="text-lg">🛠️</span>}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-brand-navy">{title}</div>
          <p className="mt-1 text-sm text-slate-600">{blurb}</p>
          {bullets.length > 0 && (
            <ul className="mt-2 text-sm text-slate-600 space-y-1 list-disc list-inside">
              {bullets.slice(0,3).map((b) => <li key={b}>{b}</li>)}
            </ul>
          )}
          <div className="mt-4">
            <span className="text-sm font-medium text-brand-blue group-hover:text-brand-lightblue">Get help →</span>
          </div>
        </div>
      </div>
    </a>
  );
}
