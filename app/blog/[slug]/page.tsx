import { notFound } from "next/navigation";
import { BlogArticlePage } from "@/components/BlogArticlePage";
import { getBlogArticle, getBlogSlugs } from "@/lib/blog";

export const dynamic = "force-static";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  if (!article) {
    return { title: "Blog" };
  }

  const title = article.seoTitle.replace(/\s*\|\s*Lever Systems\s*$/, "");

  return {
    title,
    description: article.description,
    openGraph: {
      title: article.ogTitle,
      description: article.ogDescription,
    },
  };
}

export default async function BlogArticleRoute({ params }: PageProps) {
  const { slug } = await params;
  const article = getBlogArticle(slug);

  if (!article) {
    notFound();
  }

  return <BlogArticlePage article={article} />;
}
