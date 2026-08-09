"use client";

import type { ReactNode } from "react";
import type { CaseStudyMetric, CaseStudyQuote } from "@/lib/caseStudies/types";
import { withBasePath } from "@/lib/basePath";
import { InkAnnotate } from "./system/InkAnnotate";

function CaseStudyEyebrowPill({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "brand";
}) {
  return (
    <span
      className={`cs-eyebrow-pill${variant === "brand" ? " cs-eyebrow-pill--brand" : ""}`}
    >
      {label}
    </span>
  );
}

function CaseStudyEyebrow({ label }: { label: string }) {
  return (
    <span className="eyebrow cs-eyebrow">
      <span className="sq" />
      {label}
    </span>
  );
}

function AnnotatedTitle({
  title,
  accent,
}: {
  title: string;
  accent?: string;
}) {
  if (!accent || !title.includes(accent)) {
    return <span className="cs-section__title-main">{title}</span>;
  }

  const index = title.indexOf(accent);
  return (
    <span className="cs-section__title-main">
      {title.slice(0, index)}
      <InkAnnotate variant="underline">{accent}</InkAnnotate>
      {title.slice(index + accent.length)}
    </span>
  );
}

/** Renders `**accent**` markers inside highlight / body strings with InkAnnotate. */
function AnnotatedText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    parts.push(
      <InkAnnotate variant="underline" key={key++}>
        {match[1]}
      </InkAnnotate>,
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return <>{parts.length > 0 ? parts : text}</>;
}

function CaseStudyQuoteBlock({ quote }: { quote: CaseStudyQuote }) {
  return (
    <figure className="cs-quote">
      <blockquote className="cs-quote__text">&ldquo;{quote.text}&rdquo;</blockquote>
      <figcaption className="cs-quote__author">
        {quote.avatarSrc ? (
          <img
            className="cs-quote__avatar"
            src={withBasePath(quote.avatarSrc)}
            alt=""
            loading="lazy"
            decoding="async"
            width={48}
            height={48}
          />
        ) : (
          <span className="cs-quote__avatar cs-quote__avatar--initials" aria-hidden="true">
            {quote.author
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </span>
        )}
        <span className="cs-quote__meta">
          <span className="cs-quote__role">{quote.role}</span>
          <span className="cs-quote__name">{quote.author}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function CaseStudyImpactStats({ metrics }: { metrics: CaseStudyMetric[] }) {
  return (
    <div className="cs-impact-stats">
      {metrics.map((metric, index) => {
        const variant =
          metric.variant ?? (index % 2 === 0 ? "violet" : "blue");

        return (
          <div className={`stat ${variant}`} key={index}>
            <div className="v">{metric.value}</div>
            <div className="l">{metric.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function ProseSection({
  id,
  eyebrowLabel,
  title,
  titleAccent,
  body,
}: {
  id: string;
  eyebrowLabel?: string;
  title: string;
  titleAccent?: string;
  body: string[];
}) {
  return (
    <section className="cs-section cs-prose" id={id}>
      {eyebrowLabel && <CaseStudyEyebrow label={eyebrowLabel} />}
      <h2 className="cs-section__title">
        <AnnotatedTitle title={title} accent={titleAccent} />
      </h2>
      {body.map((paragraph, index) => (
        <p className="cs-section__body" key={index}>
          <AnnotatedText text={paragraph} />
        </p>
      ))}
    </section>
  );
}

export {
  AnnotatedText,
  AnnotatedTitle,
  CaseStudyEyebrow,
  CaseStudyEyebrowPill,
  CaseStudyImpactStats,
  CaseStudyQuoteBlock,
  ProseSection,
};
