import Link from "next/link";
import { CASE_STUDY_LOGOS } from "@/lib/caseStudies";
import type { CaseStudy, CaseStudyQuote } from "@/lib/caseStudies/types";
import { withBasePath } from "@/lib/basePath";

type CaseStudyCardProps = {
  study: CaseStudy;
  variant?: "index" | "related";
};

function CaseStudyCardAuthor({ quote }: { quote: CaseStudyQuote }) {
  return (
    <div className="cs-card__author-row">
      {quote.avatarSrc ? (
        <img className="cs-card__avatar" src={withBasePath(quote.avatarSrc)} alt="" />
      ) : (
        <span className="cs-card__avatar cs-card__avatar--initials" aria-hidden="true">
          {quote.author
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </span>
      )}
      <div className="cs-card__meta">
        <span className="cs-card__author">{quote.author}</span>
        <span className="cs-card__role">{quote.role}</span>
      </div>
    </div>
  );
}

export function CaseStudyCard({ study, variant = "index" }: CaseStudyCardProps) {
  const { Logo, markClass } = CASE_STUDY_LOGOS[study.logoId];
  const metric = study.impact.metrics?.[0];
  const quoteText =
    variant === "index" ? study.heroQuote : study.featuredQuote.text;

  return (
    <Link className="cs-card" href={`/use-cases/${study.slug}`}>
      <div className={`cs-card__logo ${markClass}`}>
        <Logo />
      </div>
      {variant === "index" && (
        <span className="cs-card__industry">{study.industry}</span>
      )}
      <blockquote className="cs-card__quote">&ldquo;{quoteText}&rdquo;</blockquote>
      <CaseStudyCardAuthor quote={study.featuredQuote} />
      {metric && (
        <div className="cs-card__metric">
          <span className="cs-card__metric-value">{metric.value}</span>
          <span className="cs-card__metric-label">{metric.label}</span>
        </div>
      )}
      {variant === "related" && (
        <span className="cs-card__subtitle">{study.seo.description}</span>
      )}
      <span className="cs-card__cta">Read case study</span>
    </Link>
  );
}
