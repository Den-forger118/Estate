import { BlogCard } from "../components/Cards";
import { PageShell, SectionIntro } from "../components/SiteChrome";
import { blogPosts } from "../data/site";

export default function BlogPage() {
  return (
    <PageShell>
      <section className="page-hero">
        <div className="page-hero-inner reveal">
          <div className="stack">
            <span className="eyebrow">Blog and news</span>
            <h1>Estate updates, housing tips, and community living insights.</h1>
          </div>
          <p>
            Practical articles for residents, owners, and families comparing secure, well-managed estate communities.
          </p>
        </div>
      </section>

      <section className="section">
        <SectionIntro eyebrow="Latest articles" title="Useful reading for better residential living" text="Maintenance advice, real estate trends, estate updates, and thoughtful guidance for choosing a home." />
        <div className="blog-grid">
          {blogPosts.concat(blogPosts).map((post, index) => (
            <BlogCard key={`${post.slug}-${index}`} post={post} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
