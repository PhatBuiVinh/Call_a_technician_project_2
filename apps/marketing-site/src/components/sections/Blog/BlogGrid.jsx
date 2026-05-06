import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import PostCard from "../../UI/PostCard";
import blogDemoImage from "../../../assets/blog/blogdemo.jpg";
import Button from "../../atoms/Button";

const PAGE_SIZE = 6;

export default function BlogGrid({ posts = [] }) {
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
    image: String(featured.image || blogDemoImage)
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
            className="mt-1 w-full rounded-2xl border border-slate-200/60 px-4 py-2.5 focus-brand"
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
        <div className="group overflow-hidden rounded-2xl border border-slate-200/60 bg-white transition-transform duration-200 motion-safe:hover:-translate-y-1">
          <div className="grid md:grid-cols-2">
            {featured.image ? (
              <div className="overflow-hidden">
                <img src={safeFeatured.image} alt={safeFeatured.title} className="h-full w-full object-cover motion-standard motion-safe:group-hover:scale-105" />
              </div>
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
              <a href={`/blog/${safeFeatured.id}`} className="mt-6 inline-block rounded-full border border-slate-200/70 px-4 py-2 text-sm font-medium focus-brand hover:bg-slate-50">
                Read article →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {pageItems.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageItems.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-[40px] border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
          <SearchX className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-xl md:text-2xl font-semibold text-brand-navy">No articles matched your search</h3>
          <p className="mt-2 text-sm text-slate-500">Try a broader keyword, or browse all posts.</p>
          <div className="mt-6 flex justify-center">
            <Button type="button" variant="secondary" onClick={() => { setQ(""); setPage(1); }}>
              Clear Search
            </Button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mx-auto flex w-fit items-center justify-center gap-2 rounded-full border border-slate-200/70 bg-white/90 px-3 py-2">
          <button
            onClick={() => go(page - 1)}
            className="h-10 rounded-full px-3 py-1.5 text-sm text-slate-700 focus-brand hover:bg-slate-100 disabled:opacity-50"
            disabled={page === 1}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => go(n)}
              className={`h-10 min-w-10 rounded-full px-3 text-sm font-medium focus-brand ${
                n === page
                  ? "bg-brand-navy text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => go(page + 1)}
            className="h-10 rounded-full px-3 py-1.5 text-sm text-slate-700 focus-brand hover:bg-slate-100 disabled:opacity-50"
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
