import { useState } from "react";
import Section from "../components/layout/Section";
import NeedHelpBand from "../components/UI/NeedHelpBand";
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
        <NeedHelpBand
          title="Need help today? Book a technician in minutes."
          description="On-site support across Adelaide and nearby suburbs."
          primaryLabel="Contact Us"
          primaryTo="/contact"
          secondaryLabel="View Services"
          secondaryTo="/services"
          secondaryHref={undefined}
        />
      </Section>
    </div>
  );
}
