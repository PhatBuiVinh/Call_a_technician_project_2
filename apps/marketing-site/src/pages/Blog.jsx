import { useState } from "react";
import Section from "../components/layout/Section";
import BlogHero from "../components/sections/Blog/BlogHero";
import BlogGrid from "../components/sections/Blog/BlogGrid";
import BlogSidebar from "../components/sections/Blog/BlogSidebar";
import { useBlogPosts } from "../hooks/useBlogPosts";

export default function Blog() {
  const { posts, categories, loading, error } = useBlogPosts();
  const [activeCategory, setActiveCategory] = useState("");

  // Filter posts by category if one is selected
  const filteredPosts = activeCategory 
    ? posts.filter(p => p.category === activeCategory) 
    : posts;

  if (loading) {
    return (
      <div className="text-slate-800">
        <Section>
          <div className="container-app text-center py-10">
            <p>Loading blog posts...</p>
          </div>
        </Section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-slate-800">
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
        <div className="container-app grid lg:grid-cols-[1fr_320px] gap-8">
          <BlogGrid posts={filteredPosts} />
          <BlogSidebar
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </div>
      </Section>

      {/* CTA band */}
      <Section>
        <div className="rounded-2xl overflow-hidden">
          <div className="bg-brand-navy text-white p-8 md:p-10 relative rounded-2xl">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue to-brand-lightblue" />
            <h3 className="text-2xl font-semibold italic">
              Need help today? Book a technician in minutes.
            </h3>
            <p className="mt-2 text-white/80">
              On-site support across Adelaide and nearby suburbs.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a href="/contact" className="rounded-md bg-white text-brand-navy px-4 py-2 font-semibold hover:bg-slate-100">
                Contact Us
              </a>
              <a href="/services" className="rounded-md border border-white px-4 py-2 font-semibold hover:bg-white/10">
                View Services
              </a>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
