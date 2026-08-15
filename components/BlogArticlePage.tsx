import Link from "next/link";
import { Drawer, TopNav } from "./Chrome";
import { ClosingSection } from "./sections/ClosingSection";
import { SiteFooter } from "./lp/SiteFooter";
import { BlogArticleSignoff } from "./BlogArticleSignoff";
import { BlogNavTheme } from "./BlogNavTheme";
import { BlogViewTracker } from "./BlogViewTracker";
import { BlogProse } from "./BlogProse";
import type { BlogArticle } from "@/lib/blog";

export function BlogArticlePage({ article }: { article: BlogArticle }) {
  return (
    <>
      <BlogNavTheme />
      <BlogViewTracker event="blog_article_viewed" slug={article.slug} />
      <TopNav />
      <Drawer />

      <main id="main" className="blog-article">
        <article className="blog-article__inner">
          <p className="blog-article__kicker">
            <Link href="/blog">Blog</Link>
            <span aria-hidden="true"> · </span>
            {article.dateLabel}
          </p>
          <h1 className="blog-article__title">{article.title}</h1>
          <BlogProse blocks={article.blocks} video={article.video} skipTitle />
          <BlogArticleSignoff
            author={article.author}
            date={article.date}
            dateLabel={article.dateLabel}
          />
        </article>

        <div className="lp lp--clay cs-closing-band">
          <ClosingSection />
          <SiteFooter />
        </div>
      </main>
    </>
  );
}
