import { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Section from "../components/layout/Section";
import PostBody from "../components/sections/Blog/PostBody";
import RelatedPosts from "../components/sections/Blog/RelatedPosts";
import { useBlogPost } from "../hooks/useBlogPost";
import { useBlogPosts } from "../hooks/useBlogPosts";

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { post, loading, error } = useBlogPost(id);
  const { posts: allPosts } = useBlogPosts();

  // Compute prev/next posts - must be called before any early returns
  const idx = useMemo(() => allPosts.findIndex(p => p.id === id), [id, allPosts]);
  const prev = idx > 0 ? allPosts[idx - 1] : null;
  const next = idx < allPosts.length - 1 ? allPosts[idx + 1] : null;

  if (loading) {
    return (
      <Section>
        <div className="container-app text-center py-10">
          <p>Loading blog post...</p>
        </div>
      </Section>
    );
  }

  if (error || !post) {
    return (
      <Section>
        <div className="container-app">
          <p className="text-slate-700">Post not found.</p>
          <Link to="/blog" className="underline text-brand-blue">Back to Blog</Link>
        </div>
      </Section>
    );
  }

  return (
    <div className="text-slate-800">
      {/* Hero */}
      <Section className="relative overflow-hidden bg-gradient-to-br from-brand-blue/10 to-brand-lightblue/10">
        <div className="container-app">
          <div className="w-16 h-[3px] bg-gradient-to-r from-brand-blue via-brand-lightblue to-brand-green rounded-full" />
          <h1 className="mt-4 text-3xl md:text-4xl font-semibold italic text-brand-navy">
            {post.title}
          </h1>
          <div className="mt-2 text-sm text-slate-600">
            By {post.author} • {post.readMins} min read •{" "}
            <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
          </div>
        </div>
        <div className="absolute inset-0 bg-dot-grid text-brand-navy/10 pointer-events-none" />
      </Section>

      {/* Body */}
      <Section>
        <div className="container-app grid lg:grid-cols-[1fr_320px] gap-8">
          <div>
            {post.image ? (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-64 md:h-80 object-cover rounded-xl border"
              />
            ) : null}

            <div className="mt-6">
              <PostBody content={post.content} />
            </div>

            {/* Prev / Next */}
            <div className="mt-10 flex items-center justify-between text-sm">
              {prev ? (
                <button
                  onClick={() => navigate(`/blog/${prev.id}`)}
                  className="rounded-md border px-3 py-2 hover:bg-slate-50"
                >
                  ← {prev.title}
                </button>
              ) : <span />}

              {next ? (
                <button
                  onClick={() => navigate(`/blog/${next.id}`)}
                  className="rounded-md border px-3 py-2 hover:bg-slate-50"
                >
                  {next.title} →
                </button>
              ) : <span />}
            </div>

            {/* Related */}
            <RelatedPosts allPosts={allPosts} currentId={post.id} category={post.category} />
          </div>

          {/* Sidebar: About the author */}
          <aside className="space-y-6">
            <div className="rounded-xl border bg-white p-4">
              <div className="font-semibold text-brand-navy">About the author</div>
              <p className="mt-1 text-sm text-slate-600">
                {post.authorBio || `${post.author} is a technician at Call-a-Technician working on networking and device performance.`}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-4">
              <div className="font-semibold text-brand-navy">Need hands-on help?</div>
              <p className="mt-1 text-sm text-slate-600">
                We fix Wi-Fi, backups, malware and more — on-site in Adelaide.
              </p>
              <a href="/contact" className="mt-3 inline-block rounded-md bg-brand-blue text-white px-3 py-2 text-sm hover:bg-brand-navy">
                Book a Technician
              </a>
            </div>
          </aside>
        </div>
      </Section>
    </div>
  );
}
