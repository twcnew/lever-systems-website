import type { CSSProperties } from "react";
import { CASE_STUDY_LOGOS } from "@/lib/caseStudies";
import type { CaseStudy, CaseStudyVisual } from "@/lib/caseStudies/types";
import { withBasePath } from "@/lib/basePath";

type CaseStudySideNavVisualProps = {
  logoId: CaseStudy["logoId"];
  brandColor: string;
  sideNavImage?: CaseStudyVisual;
};

export function CaseStudySideNavVisual({
  logoId,
  brandColor,
  sideNavImage,
}: CaseStudySideNavVisualProps) {
  const { Logo, markClass } = CASE_STUDY_LOGOS[logoId];

  return (
    <div
      className={`cs-side-nav__visual${sideNavImage ? " cs-side-nav__visual--image" : ""}`}
      style={{ "--cs-hero-accent": brandColor } as CSSProperties}
    >
      {sideNavImage ? (
        <img
          className="cs-side-nav__visual-img"
          src={withBasePath(sideNavImage.src)}
          alt={sideNavImage.alt}
          loading="lazy"
          decoding="async"
          width={800}
          height={800}
        />
      ) : (
        <div className={`cs-side-nav__logo cs-company-logo ${markClass}`}>
          <Logo />
        </div>
      )}
    </div>
  );
}
