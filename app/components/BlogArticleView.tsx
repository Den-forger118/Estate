import Image from "next/image";
import Link from "next/link";
import { formatBlogDate, type BlogPost } from "../data/site";
import { BlogClosingBand } from "./BlogClosingBand";

export function BlogArticleView({ post, related }: { post: BlogPost; related: BlogPost[] }) {
  return (
    <>
      <section className="blog-article-hero" aria-labelledby="article-heading">
        <div className="blog-article-hero-media">
          <Image
            src={post.image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="blog-article-hero-image"
          />
          <div className="blog-article-hero-overlay" aria-hidden="true" />
        </div>
        <div className="blog-article-hero-copy">
          <Link href="/blog" className="blog-article-back">
            ← Journal
          </Link>
          <p className="meta blog-article-meta">
            <span className="font-data-md">{formatBlogDate(post.date)}</span> · {post.category} ·{" "}
            {post.readTime}
          </p>
          <h1 id="article-heading" className="font-display-h1 blog-article-title">
            {post.title}
          </h1>
          <p className="blog-article-deck">{post.excerpt}</p>
        </div>
      </section>

      <div className="blog-article-body-wrap">
        <article className="blog-article-body">
          {post.content.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </article>
      </div>

      {related.length > 0 ? (
        <section className="blog-related section" aria-labelledby="related-heading">
          <div className="blog-related-head">
            <span className="eyebrow">Continue reading</span>
            <h2 id="related-heading" className="font-headline-section">
              Related articles
            </h2>
          </div>
          <div className="blog-related-grid">
            {related.map((item) => (
              <Link key={item.slug} href={`/blog/${item.slug}`} className="blog-related-card card-interactive">
                <div className="blog-related-media">
                  <Image src={item.image} alt="" fill sizes="320px" className="blog-related-image" />
                </div>
                <div className="blog-related-body">
                  <p className="meta">
                    <span className="font-data-md">{formatBlogDate(item.date)}</span> · {item.category}
                  </p>
                  <h3>{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <BlogClosingBand />
    </>
  );
}
