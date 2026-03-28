import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  // Defensive rendering to ensure all displayed values are strings
  const safePost = {
    id: String(post.id || 'unknown'),
    title: String(post.title || 'Untitled Post'),
    category: String(post.category || 'Tips'),
    author: String(post.author || 'Anonymous'),
    readMins: Number(post.readMins) || 5,
    date: String(post.date || new Date().toISOString()),
    image: String(post.image || '/src/assets/blog/blogdemo.jpg')
  }

  return (
    <article className="group rounded-xl border bg-white overflow-hidden hover:shadow-lg transition">
      <Link to={`/blog/${safePost.id}`} className="block">
        {safePost.image ? (
          <img
            src={safePost.image}
            alt={safePost.title}
            className="h-44 w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-44 w-full bg-slate-100" />
        )}
      </Link>

      <div className="p-4">
        <div className="text-xs uppercase tracking-wide text-brand-blue">{safePost.category}</div>
        <h3 className="mt-1 font-semibold text-brand-navy leading-snug line-clamp-2">
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
