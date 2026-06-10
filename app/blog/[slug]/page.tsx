import { notFound } from "next/navigation";
import { BlogArticleView } from "../../components/BlogArticleView";
import { PageShell } from "../../components/SiteChrome";
import { blogPosts } from "../../data/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  return {
    title: post ? `${post.title} | Special Gardens` : "Article | Special Gardens",
    description: post?.excerpt,
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  const related = blogPosts
    .filter((item) => item.slug !== post.slug && item.category === post.category)
    .slice(0, 2);

  const fallbackRelated =
    related.length > 0
      ? related
      : blogPosts.filter((item) => item.slug !== post.slug).slice(0, 2);

  return (
    <PageShell>
      <BlogArticleView post={post} related={fallbackRelated} />
    </PageShell>
  );
}
