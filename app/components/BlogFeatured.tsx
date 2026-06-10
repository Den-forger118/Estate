import Image from "next/image";
import Link from "next/link";
import { formatBlogDate, type BlogPost } from "../data/site";

export function BlogFeatured({ post }: { post: BlogPost }) {
  return (
    <section className="blog-featured" aria-labelledby="blog-featured-heading">
      <Link href={`/blog/${post.slug}`} className="blog-featured-card card-interactive">
        <div className="blog-featured-media">
          <Image
            src={post.image}
            alt=""
            fill
            priority
            sizes="(max-width: 980px) 100vw, 60vw"
            className="blog-featured-image"
          />
          <div className="blog-featured-shade" aria-hidden="true" />
        </div>
        <div className="blog-featured-copy">
          <span className="eyebrow blog-featured-eyebrow">Featured</span>
          <p className="meta blog-featured-meta">
            <span className="font-data-md">{formatBlogDate(post.date)}</span> · {post.category} ·{" "}
            {post.readTime}
          </p>
          <h2 id="blog-featured-heading" className="font-headline-section blog-featured-title">
            {post.title}
          </h2>
          <p className="blog-featured-excerpt">{post.excerpt}</p>
          <span className="community-inline-link">Read article →</span>
        </div>
      </Link>
    </section>
  );
}
