import { useMemo, useState } from "react";
import PostCard from "../../UI/PostCard";

const PAGE_SIZE = 6;

export default function BlogGrid({ posts = [], onPickCategory }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  // featured = first post with featured:true (optional)
  const featured = useMemo(() => posts.find((p) => p.featured), [posts]);

  // Defensive rendering for featured post
  const safeFeatured = featured ? {
    id: String(featured.id || 'unknown'),
    title: String(featured.title || 'Untitled Post'),
    category: String(featured.category || 'Tips'),
    author: String(featured.author || 'Anonymous'),
    readMins: Number(featured.readMins) || 5,
    date: String(featured.date || new Date().toISOString()),
    image: String(featured.image || '/src/assets/blog/blogdemo.jpg')
  } : null;

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = s
      ? posts.filter(
          (p) =>
            p.title.toLowerCase().includes(s) ||
            p.category.toLowerCase().includes(s)
        )
      : posts;
    return list;
  }, [q, posts]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  function go(p) {
    setPage(Math.min(Math.max(1, p), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <label className="text-sm text-slate-600 w-full sm:max-w-md">
          Search articles
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-lightblue/60"
            placeholder="e.g., Wi-Fi, backups, Windows…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />
        </label>
        <div className="text-sm text-slate-600 sm:ml-auto">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Featured (optional) */}
      {featured && (
        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="grid md:grid-cols-2">
            {featured.image ? (
              <img src={safeFeatured.image} alt={safeFeatured.title} className="h-full w-full object-cover" />
            ) : (
              <div className="bg-slate-100 h-full w-full" />
            )}
            <div className="p-6">
              <div className="text-xs uppercase tracking-wide text-brand-blue">{safeFeatured.category}</div>
              <h2 className="mt-1 text-2xl font-semibold text-brand-navy">{safeFeatured.title}</h2>
              <div className="mt-4 text-sm text-slate-500">
                By {safeFeatured.author} • {safeFeatured.readMins} min read •{" "}
                {new Date(safeFeatured.date).toLocaleDateString()}
              </div>
              <a href={`/blog/${safeFeatured.id}`} className="mt-6 inline-block rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50">
                Read article →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pageItems.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => go(page - 1)}
            className="rounded-md border bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
            disabled={page === 1}
          >
            Prev
          </button>
          <div className="text-sm text-slate-700">
            Page <span className="font-semibold">{page}</span> of {totalPages}
          </div>
          <button
            onClick={() => go(page + 1)}
            className="rounded-md border bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
