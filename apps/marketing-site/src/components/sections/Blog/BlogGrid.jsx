import { useMemo } from "react";
import PostCard from "../../UI/PostCard";

export default function BlogGrid({ posts = [], categories = [], activeCategory, onPickCategory }) {
  const featured = useMemo(
    () => posts.find(p => p.featured) || posts[0] || null,
    [posts]
  );

  const rest = useMemo(
    () => (featured ? posts.filter(p => p.id !== featured.id) : posts),
    [posts, featured]
  );

  const showHero = !activeCategory && featured;
  const gridPosts = showHero ? rest : posts;

  return (
    <div className="space-y-10">
      {/* Category filter pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onPickCategory("")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              !activeCategory
                ? "bg-brand-blue text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onPickCategory(activeCategory === cat ? "" : cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                activeCategory === cat
                  ? "bg-brand-blue text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-slate-500">No articles found.</p>
        </div>
      ) : (
        <>
          {/* Featured hero card */}
          {showHero && <PostCard post={featured} featured={true} />}

          {/* Grid */}
          {gridPosts.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.map(p => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
