"use client";

import Link from "next/link";
import { Drawer, TopNav } from "./Chrome";
import { ClosingSection } from "./sections/ClosingSection";
import { SiteFooter } from "./lp/SiteFooter";
import { LpModule } from "./lp/LpModule";
import { InkAnnotate } from "./system/InkAnnotate";
import { BlogNavTheme } from "./BlogNavTheme";
import { BlogViewTracker } from "./BlogViewTracker";
import type { BlogIndex } from "@/lib/blog";
import { withBasePath } from "@/lib/basePath";
import { track } from "@/lib/analytics";

export function BlogIndexPage({ index }: { index: BlogIndex }) {
  const { article } = index;
  const [first, second] = index.lede;

  return (
    <>
      <BlogNavTheme />
      <BlogViewTracker event="blog_index_viewed" />
      <TopNav />
      <Drawer />

      <main id="main" className="blog-index">
        <div className="lp lp--clay">
          <LpModule
            id="blog"
            className="blog-index__intro"
            label={index.label}
            title={index.title}
            titleAccent={
              index.titleAccent ? (
                <InkAnnotate variant="underline">{index.titleAccent}</InkAnnotate>
              ) : undefined
            }
            sub={first}
          >
            {second ? <p className="blog-index__note">{second}</p> : null}
            <Link
              className="blog-card"
              href={article.path}
              onClick={() =>
                track("blog_card_clicked", {
                  slug: article.slug,
                  href: article.path,
                })
              }
            >
              <span className="blog-card__copy">
                <span className="blog-card__kicker">
                  {article.cardKicker}
                  <span aria-hidden="true"> · </span>
                  {article.dateLabel}
                </span>
                <span className="blog-card__title">{article.cardTitle}</span>
                <span className="blog-card__excerpt">{article.cardExcerpt}</span>
                <span className="blog-card__more">Read →</span>
              </span>
              {article.cardImage ? (
                <span className="blog-card__media">
                  <img
                    className="blog-card__img"
                    src={withBasePath(article.cardImage)}
                    alt=""
                  />
                </span>
              ) : null}
            </Link>
          </LpModule>
        </div>

        <div className="lp lp--clay cs-closing-band">
          <ClosingSection />
          <SiteFooter />
        </div>
      </main>
    </>
  );
}
