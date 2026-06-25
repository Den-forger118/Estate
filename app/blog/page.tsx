import { BlogClosingBand } from "../components/BlogClosingBand";
import { BlogFeatured } from "../components/BlogFeatured";
import { BlogHero } from "../components/BlogHero";
import { BlogIndex } from "../components/BlogIndex";
import { PageShell } from "../components/SiteChrome";
import { blogPosts, getFeaturedBlogPost } from "../data/site";

export default function BlogPage() {
  const featured = getFeaturedBlogPost();

  return (
    <PageShell>
      <BlogHero />
      <BlogFeatured post={featured} />
      <BlogIndex posts={blogPosts} featuredSlug={featured.slug} />
      <BlogClosingBand />
    </PageShell>
  );
}
