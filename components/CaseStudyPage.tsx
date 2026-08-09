import type { CSSProperties } from "react";
import {
  AnnotatedText,
  AnnotatedTitle,
  CaseStudyEyebrow,
  CaseStudyEyebrowPill,
  ProseSection,
} from "./CaseStudyBlocks";
import { CaseStudyRelated } from "./CaseStudyRelated";
import { CaseStudyStickyNav } from "./CaseStudyStickyNav";
import { CaseStudyHero } from "./CaseStudyHero";
import { CaseStudyNavTheme } from "./CaseStudyNavTheme";
import { CaseStudySideNavVisual } from "./CaseStudySideNavVisual";
import { CaseStudyVisualSlot } from "./CaseStudyVisualSlot";
import { Drawer, TopNav } from "./Chrome";
import { SiteFooter } from "./lp/SiteFooter";
import { ClosingSection } from "./sections/ClosingSection";
import {
  getCaseStudyNavItems,
} from "@/lib/caseStudies";
import type { CaseStudy, CaseStudyUseCase } from "@/lib/caseStudies/types";

function isLightBrandAccent(hex: string) {
  const raw = hex.replace("#", "").trim();
  if (raw.length !== 6) return false;
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return false;
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.65;
}

type CaseStudyPageProps = {
  study: CaseStudy;
};

function CaseStudyMetaCard({ study }: { study: CaseStudy }) {
  return (
    <div className="cs-glance__card">
      <span className="cs-glance__card-label">Company</span>
      <p className="cs-glance__desc">{study.companyDescription}</p>
      {study.websiteUrl?.startsWith("http") && (
        <a
          className="cs-glance__link"
          href={study.websiteUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Visit {study.company} ↗
        </a>
      )}
      <dl className="cs-glance__meta">
        <div>
          <dt>Industry</dt>
          <dd>{study.industry}</dd>
        </div>
        <div>
          <dt>Headquarters</dt>
          <dd>{study.headquarters}</dd>
        </div>
      </dl>
    </div>
  );
}

function CaseStudySideNav({
  study,
  navItems,
}: {
  study: CaseStudy;
  navItems: ReturnType<typeof getCaseStudyNavItems>;
}) {
  return (
    <aside className="cs-side-nav">
      <CaseStudySideNavVisual
        logoId={study.logoId}
        brandColor={study.brandColor}
        sideNavImage={study.sideNavImage}
      />
      <CaseStudyStickyNav items={navItems} />
    </aside>
  );
}

function UseCaseSection({ useCase }: { useCase: CaseStudyUseCase }) {
  const [lead, ...rest] = useCase.body;

  return (
    <section
      className="cs-section cs-section--use-case"
      id={`use-case-${useCase.number}`}
    >
      <div className="cs-prose">
        <CaseStudyEyebrow label={`Use case ${useCase.number}`} />
        <h2 className="cs-section__title">
          <AnnotatedTitle title={useCase.title} accent={useCase.titleAccent} />
        </h2>
        {lead && (
          <p className="cs-section__body">
            <AnnotatedText text={lead} />
          </p>
        )}
      </div>
      {useCase.visual && <CaseStudyVisualSlot visual={useCase.visual} />}
      <div className="cs-prose">
        {rest.map((paragraph, index) => (
          <p className="cs-section__body" key={index}>
            <AnnotatedText text={paragraph} />
          </p>
        ))}
        {useCase.bullets && useCase.bullets.length > 0 && (
          <ul className="cs-bullets">
            {useCase.bullets.map((item, index) => (
              <li key={index}>
                <AnnotatedText text={item} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function CaseStudyPage({ study }: CaseStudyPageProps) {
  const navItems = getCaseStudyNavItems(study);
  const accentTone = isLightBrandAccent(study.brandColor) ? "light" : undefined;

  return (
    <div
      className="cs-shell"
      data-accent-tone={accentTone}
      style={{ "--cs-hero-accent": study.brandColor } as CSSProperties}
    >
      <TopNav />
      <Drawer />
      <CaseStudyNavTheme />

      <CaseStudyHero study={study} />

      <div className="cs-body cs-body--sheet">
        <div className="cs-container">
          <div className="cs-page-layout">
            <div className="cs-main">
              <section className="cs-glance" id="at-a-glance">
                <CaseStudyEyebrowPill label="At a glance" variant="brand" />
                <h1 className="cs-glance__quote">
                  &ldquo;{study.heroQuote}&rdquo;
                </h1>

                <div className="cs-glance__split">
                  <CaseStudyMetaCard study={study} />

                  <div className="cs-glance__prose cs-prose">
                    {study.intro.map((paragraph, index) => (
                      <p className="cs-glance__body" key={index}>
                        <AnnotatedText text={paragraph} />
                      </p>
                    ))}
                    {study.impactHighlights.length > 0 && (
                      <div className="cs-highlights">
                        <h3 className="cs-highlights__title">Impact highlights</h3>
                        <ul className="cs-highlights__list">
                          {study.impactHighlights.map((item, index) => (
                            <li key={index}>
                              <AnnotatedText text={item} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <div className="cs-article">
                <ProseSection
                  id="problem"
                  eyebrowLabel="The problem"
                  title={study.problem.title}
                  titleAccent={study.problem.titleAccent}
                  body={study.problem.body}
                />

                <ProseSection
                  id="solution"
                  eyebrowLabel="The solution"
                  title={study.solution.title}
                  titleAccent={study.solution.titleAccent}
                  body={study.solution.body}
                />

                {study.useCases.map((useCase) => (
                  <UseCaseSection useCase={useCase} key={useCase.number} />
                ))}

                <section className="cs-section cs-prose" id="impact">
                  <CaseStudyEyebrow label="Results" />
                  <h2 className="cs-section__title">
                    <AnnotatedTitle
                      title={study.impact.title}
                      accent={study.impact.titleAccent}
                    />
                  </h2>
                  {study.impact.body.map((paragraph, index) => (
                    <p className="cs-section__body" key={index}>
                      <AnnotatedText text={paragraph} />
                    </p>
                  ))}
                </section>
              </div>
            </div>

            <CaseStudySideNav study={study} navItems={navItems} />
          </div>
        </div>
      </div>

      <CaseStudyRelated study={study} />

      <div className="lp lp--clay cs-closing-band">
        <ClosingSection />
        <SiteFooter />
      </div>
    </div>
  );
}
