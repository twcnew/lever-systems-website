import Link from "next/link";
import { CASE_STUDY_LOGOS } from "@/lib/caseStudies";
import type { CaseStudy } from "@/lib/caseStudies/types";
import { withBasePath } from "@/lib/basePath";

type CaseStudyIndexCardProps = {
  study: CaseStudy;
};

export function CaseStudyIndexCard({ study }: CaseStudyIndexCardProps) {
  const { Logo, markClass } = CASE_STUDY_LOGOS[study.logoId];
  const metric = study.impact.metrics?.find((item) => !item.value.startsWith("[TODO"));
  const quote = study.featuredQuote;

  return (
    <article className="cs-index-card">
      <div className="cs-index-card__content">
        <h3 className="cs-index-card__company">{study.company}</h3>
        <blockquote className="cs-index-card__quote">
          &ldquo;{quote.text}&rdquo;
        </blockquote>
        <div className="cs-index-card__author">
          {quote.avatarSrc ? (
            <img className="cs-index-card__avatar" src={withBasePath(quote.avatarSrc)} alt="" />
          ) : (
            <span className="cs-index-card__avatar cs-index-card__avatar--initials" aria-hidden="true">
              {quote.author
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
          )}
          <div className="cs-index-card__meta">
            <span className="cs-index-card__author-name">{quote.author}</span>
            <span className="cs-index-card__author-role">{quote.role}</span>
          </div>
        </div>
        {metric && (
          <div className="cs-index-card__metric">
            <span className="cs-index-card__metric-value">{metric.value}</span>
            <span className="cs-index-card__metric-label">{metric.label}</span>
          </div>
        )}
        <Link className="cs-index-card__link" href={`/use-cases/${study.slug}`}>
          Read case study
        </Link>
      </div>
      <div className="cs-index-card__media">
        {study.indexCard.imageSrc ? (
          <img
            className="cs-index-card__cover"
            src={withBasePath(study.indexCard.imageSrc)}
            alt=""
          />
        ) : (
          <div className={`cs-index-card__placeholder ${markClass}`}>
            <Logo />
          </div>
        )}
        <p className="cs-index-card__headline">{study.indexCard.headline}</p>
      </div>
    </article>
  );
}
