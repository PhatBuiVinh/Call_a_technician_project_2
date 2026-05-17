import { useState } from "react";
import Section from "../components/layout/Section";
import BlogHero from "../components/sections/Blog/BlogHero";
import BlogGrid from "../components/sections/Blog/BlogGrid";
import { useBlogPosts } from "../hooks/useBlogPosts";

export default function Blog() {
  const { posts, categories, loading, error } = useBlogPosts();
  const [activeCategory, setActiveCategory] = useState("");

  const filteredPosts = activeCategory
    ? posts.filter(p => p.category === activeCategory)
    : posts;

  if (loading) {
    return (
      <div className="text-slate-800">
        <BlogHero />
        <Section>
          <div className="container-app">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-xl border bg-white overflow-hidden animate-pulse">
                  <div className="h-48 bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-slate-800">
        <BlogHero />
        <Section>
          <div className="container-app text-center py-10">
            <p className="text-red-600">Error loading blog posts: {error}</p>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div className="text-slate-800">
      <BlogHero />

      <Section>
        <div className="container-app">
          <BlogGrid
            posts={filteredPosts}
            categories={categories}
            activeCategory={activeCategory}
            onPickCategory={setActiveCategory}
          />
        </div>
      </Section>

      {/* CTA band */}
      <Section muted>
        <div className="container-app">
          <div className="rounded-2xl bg-brand-navy text-white p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue to-brand-green rounded-t-2xl" />
            <h3 className="text-2xl font-bold">Need help today? Book a technician in minutes.</h3>
            <p className="mt-2 text-white/80">On-site support across Adelaide — same day, 7 days a week.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a href="/contact" className="rounded-lg bg-brand-green text-brand-navy px-5 py-2.5 font-bold hover:brightness-110 transition w-fit">
                Book Now
              </a>
              <a href="/services" className="rounded-lg border border-white/50 px-5 py-2.5 font-semibold hover:bg-white/10 transition w-fit">
                View Services
              </a>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
