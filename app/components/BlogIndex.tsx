"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatBlogDate, type BlogPost } from "../data/site";

export function BlogIndex({
  posts,
  featuredSlug,
}: {
  posts: BlogPost[];
  featuredSlug: string;
}) {
  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
  const [activeCategory, setActiveCategory] = useState("All");
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const filtered = useMemo(() => {
    const pool =
      activeCategory === "All"
        ? posts.filter((post) => post.slug !== featuredSlug)
        : posts.filter((post) => post.category === activeCategory);

    return pool.sort((a, b) => b.date.localeCompare(a.date));
  }, [activeCategory, featuredSlug, posts]);

  useEffect(() => {
    const node = gridRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="blog-index section" aria-labelledby="blog-index-heading">
      <div className="blog-index-head">
        <div>
          <span className="eyebrow">Latest articles</span>
          <h2 id="blog-index-heading" className="font-headline-section">
            Useful reading for better residential living
          </h2>
        </div>
        <div className="blog-filter-bar" role="tablist" aria-label="Filter articles by category">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={activeCategory === category}
              className={activeCategory === category ? "active" : ""}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="blog-index-empty">No articles in this category yet.</p>
      ) : (
        <div
          ref={gridRef}
          className={`blog-index-grid${filtered.length === 2 ? " blog-index-grid-pair" : ""}${visible ? " is-visible" : ""}`}
        >
          {filtered.map((post, index) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={`blog-index-card card-interactive blog-index-animate blog-index-animate-${index + 1}${index === 0 && filtered.length >= 2 ? " blog-index-card-lead" : ""}`}
            >
              <div className="blog-index-card-media">
                <Image src={post.image} alt="" fill sizes="(max-width: 768px) 100vw, 40vw" className="blog-index-card-image" />
              </div>
              <div className="blog-index-card-body">
                <p className="meta">
                  <span className="font-data-md">{formatBlogDate(post.date)}</span> · {post.category}
                </p>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <span className="community-inline-link">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
