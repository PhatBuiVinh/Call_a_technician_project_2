import { Link } from "react-router-dom";
import blogDemoImage from "../../assets/blog/blogdemo.jpg";

export default function PostCard({ post }) {
  // Defensive rendering to ensure all displayed values are strings
  const safePost = {
    id: String(post.id || 'unknown'),
    title: String(post.title || 'Untitled Post'),
    category: String(post.category || 'Tips'),
    author: String(post.author || 'Anonymous'),
    readMins: Number(post.readMins) || 5,
    date: String(post.date || new Date().toISOString()),
    image: String(post.image || blogDemoImage)
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/50 bg-white transition-transform duration-200 motion-safe:hover:-translate-y-1 hover:border-brand-blue/35">
      <Link to={`/blog/${safePost.id}`} className="block overflow-hidden">
        {safePost.image ? (
          <img
            src={safePost.image}
            alt={safePost.title}
            className="h-44 w-full object-cover motion-standard motion-safe:group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-44 w-full bg-slate-100" />
        )}
      </Link>

      <div className="p-4">
        <div className="text-xs uppercase tracking-wide text-brand-blue">{safePost.category}</div>
        <h3 className="mt-1 text-xl md:text-2xl font-semibold leading-snug text-brand-navy line-clamp-2">
          <Link to={`/blog/${safePost.id}`}>{safePost.title}</Link>
        </h3>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <div>By {safePost.author} • {safePost.readMins} min read</div>
          <time dateTime={safePost.date}>{new Date(safePost.date).toLocaleDateString()}</time>
        </div>
      </div>
    </article>
  );
}
