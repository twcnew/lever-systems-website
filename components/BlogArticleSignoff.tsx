"use client";

import { FounderNameInk } from "./system/FounderNameInk";
import { ABOUT_CONTENT } from "@/lib/aboutContent";
import { withBasePath } from "@/lib/basePath";
import { track } from "@/lib/analytics";

export function BlogArticleSignoff({
  author,
  date,
  dateLabel,
}: {
  author: string;
  date: string;
  dateLabel: string;
}) {
  const { founder } = ABOUT_CONTENT;

  return (
    <footer className="blog-article__signoff">
      <a
        className="blog-article__avatar-link"
        href={founder.linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${founder.name} on LinkedIn`}
        onClick={() =>
          track("social_outbound_clicked", {
            network: "linkedin",
            location: "blog_article",
            href: founder.linkedinUrl,
          })
        }
      >
        <img
          className="blog-article__avatar"
          src={withBasePath(founder.photo)}
          alt=""
          width={48}
          height={48}
          loading="lazy"
          decoding="async"
        />
      </a>
      <div className="blog-article__author-copy">
        <FounderNameInk
          name={author}
          className="blog-article__signature"
          timing="early"
          size="footer"
        />
        <time className="blog-article__date" dateTime={date}>
          {dateLabel}
        </time>
      </div>
    </footer>
  );
}
