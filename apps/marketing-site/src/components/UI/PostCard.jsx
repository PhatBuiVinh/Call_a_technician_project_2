import { Link } from "react-router-dom";
import blogDemoImage from "../../assets/blog/blogdemo.jpg";

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleString("en-AU", { month: "short" }).toUpperCase();
    const year = d.getFullYear();
    return `${day} ${month}, ${year}`;
  } catch {
    return dateStr;
  }
}

export default function PostCard({ post, featured = false }) {
  const safePost = {
    id: String(post?.id || "unknown"),
    title: String(post?.title || "Untitled Post"),
    category: String(post?.category || "Tips"),
    author: String(post?.author || "Mustafa Kadir"),
    readMins: Number(post?.readMins) || 5,
    date: String(post?.date || new Date().toISOString()),
    image: String(post?.image || blogDemoImage),
    excerpt: String(post?.excerpt || ""),
  };

  if (featured) {
    return (
      <article className="group rounded-2xl border bg-white overflow-hidden hover:shadow-lg transition">
        <div className="grid md:grid-cols-[1fr_420px]">
          <Link to={`/blog/${safePost.id}`} className="block overflow-hidden">
            <img
              src={safePost.image}
              alt={safePost.title}
              className="h-64 md:h-full w-full object-cover group-hover:scale-[1.02] transition duration-500"
              loading="eager"
            />
          </Link>
          <div className="p-7 md:p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-blue bg-brand-blue/10 rounded-full px-3 py-1">
                {safePost.category}
              </span>
              <time className="text-xs text-slate-500">{formatDate(safePost.date)}</time>
            </div>
            <h2 className="mt-3 text-xl md:text-2xl font-bold text-brand-navy leading-snug group-hover:text-brand-blue transition line-clamp-3">
              <Link to={`/blog/${safePost.id}`}>{safePost.title}</Link>
            </h2>
            {safePost.excerpt && (
              <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-4">{safePost.excerpt}</p>
            )}
            <div className="mt-4 text-xs text-slate-500">By {safePost.author} · {safePost.readMins} min read</div>
            <Link
              to={`/blog/${safePost.id}`}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-blue text-white px-5 py-2.5 text-sm font-semibold hover:bg-brand-navy transition w-fit"
            >
              Read article →
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group rounded-xl border bg-white overflow-hidden hover:shadow-lg transition flex flex-col">
      <Link to={`/blog/${safePost.id}`} className="block shrink-0 overflow-hidden">
        <img
          src={safePost.image}
          alt={safePost.title}
          className="h-48 w-full object-cover group-hover:scale-[1.02] transition duration-300"
          loading="lazy"
        />
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <time className="text-xs text-slate-500 font-medium tracking-wide">{formatDate(safePost.date)}</time>
        <h3 className="mt-2 font-bold text-brand-navy leading-snug line-clamp-2 text-base group-hover:text-brand-blue transition">
          <Link to={`/blog/${safePost.id}`}>{safePost.title}</Link>
        </h3>
        {safePost.excerpt && (
          <p className="mt-2 text-sm text-slate-600 line-clamp-3 flex-1 leading-relaxed">{safePost.excerpt}</p>
        )}
        <Link
          to={`/blog/${safePost.id}`}
          className="mt-4 text-sm font-semibold text-brand-blue hover:text-brand-navy transition inline-flex items-center gap-1"
        >
          Read more →
        </Link>
      </div>
    </article>
  );
}
