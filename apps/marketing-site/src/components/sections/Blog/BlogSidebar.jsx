import { Link } from "react-router-dom";

export default function BlogSidebar({ categories, activeCategory, onSelectCategory }) {
  return (
    <aside className="space-y-6">
      <section className="rounded-xl border bg-white p-4">
        <div className="font-semibold text-brand-navy">Categories</div>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <button
              onClick={() => onSelectCategory("")}
              className={`hover:underline ${!activeCategory ? "font-semibold text-brand-blue" : ""}`}
            >
              All
            </button>
          </li>
          {categories.map((c) => (
            <li key={c}>
              <button
                onClick={() => onSelectCategory(c)}
                className={`hover:underline ${activeCategory === c ? "font-semibold text-brand-blue" : ""}`}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
