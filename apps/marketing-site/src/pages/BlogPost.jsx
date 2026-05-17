import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Section from "../components/layout/Section";
import PostBody from "../components/sections/Blog/PostBody";
import PostCard from "../components/UI/PostCard";
import { useBlogPost } from "../hooks/useBlogPost";
import { useBlogPosts } from "../hooks/useBlogPosts";
import { Phone } from "lucide-react";

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

export default function BlogPost() {
  const { id } = useParams();
  const { post, loading, error } = useBlogPost(id);
  const { posts: allPosts } = useBlogPosts();

  const related = useMemo(() => {
    if (!post || !allPosts.length) return [];
    const sameCat = allPosts.filter(p => p.id !== id && p.category === post.category);
    return sameCat.length >= 3 ? sameCat.slice(0, 3) : allPosts.filter(p => p.id !== id).slice(0, 3);
  }, [post, allPosts, id]);

  if (loading) {
    return (
      <div className="min-h-[60vh]">
        <Section>
          <div className="container-app max-w-3xl mx-auto space-y-4 animate-pulse">
            <div className="h-3 bg-slate-200 rounded w-1/4" />
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/3" />
          </div>
        </Section>
        <div className="container-app max-w-4xl mx-auto px-4">
          <div className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <Section>
        <div className="container-app max-w-3xl mx-auto">
          <p className="text-slate-700">Post not found.</p>
          <Link to="/blog" className="mt-3 inline-block text-brand-blue underline">← Back to Blog</Link>
        </div>
      </Section>
    );
  }

  return (
    <div className="text-slate-800">
      {/* Article header */}
      <Section>
        <div className="container-app max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 flex-wrap">
            <Link to="/" className="hover:text-brand-blue transition">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-brand-blue transition">Blog</Link>
            <span>/</span>
            <span className="text-slate-600 truncate max-w-xs">{post.title}</span>
          </nav>

          {/* Category + date */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue bg-brand-blue/10 rounded-full px-3 py-1">
              {post.category}
            </span>
            <time className="text-xs text-slate-500">{formatDate(post.date)}</time>
            <span className="text-xs text-slate-400">· {post.readMins} min read</span>
          </div>

          {/* Title */}
          <h1 className="mt-4 text-3xl md:text-4xl font-bold text-brand-navy leading-snug">
            {post.title}
          </h1>

          {/* Author */}
          <p className="mt-3 text-sm text-slate-500">By {post.author}</p>

          {/* Excerpt as lead */}
          {post.excerpt && (
            <p className="mt-5 text-lg text-slate-600 leading-relaxed border-l-4 border-brand-blue pl-4 italic">
              {post.excerpt}
            </p>
          )}
        </div>
      </Section>

      {/* Hero image — full width, outside section padding */}
      {post.image && (
        <div className="container-app max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-2">
          <img
            src={post.image}
            alt={post.title}
            className="w-full rounded-2xl object-cover max-h-[480px]"
          />
        </div>
      )}

      {/* Article body */}
      <Section>
        <div className="container-app max-w-3xl mx-auto">
          <PostBody content={post.content} />
        </div>
      </Section>

      {/* Mid-article CTA */}
      <Section muted>
        <div className="container-app max-w-3xl mx-auto">
          <div className="rounded-2xl bg-brand-navy text-white p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue to-brand-green" />
            <div className="flex-1">
              <h3 className="text-xl font-bold">Need hands-on help in Adelaide?</h3>
              <p className="mt-1 text-white/75 text-sm leading-relaxed">
                Same-day visits across Adelaide. Wi-Fi issues, virus removal, slow computers — we fix it all on-site.
              </p>
            </div>
            <a
              href="/contact"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-brand-green text-brand-navy px-6 py-3 font-bold text-sm hover:brightness-110 transition whitespace-nowrap"
            >
              <Phone size={15} />
              Book a Technician
            </a>
          </div>
        </div>
      </Section>

      {/* Related posts */}
      {related.length > 0 && (
        <Section>
          <div className="container-app">
            <h2 className="text-2xl font-bold text-brand-navy mb-2">More articles you might like</h2>
            <p className="text-sm text-slate-500 mb-6">Keep reading — more tips and guides from our technicians.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(p => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Back to blog */}
      <div className="container-app max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-brand-blue hover:text-brand-navy font-semibold transition"
        >
          ← Back to all articles
        </Link>
      </div>
    </div>
  );
}
