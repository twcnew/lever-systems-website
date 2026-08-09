"use client";

import { HERO_LOGO_ENTRIES } from "@/lib/heroLogoStrip";
import { withBasePath } from "@/lib/basePath";
import { track } from "@/lib/analytics";

export function HeroLogoStrip() {
  return (
    <div className="hero__logos" data-logos>
      <span className="hero__logos-eyebrow">Worked with</span>
      <div className="hero__logos-grid">
        {HERO_LOGO_ENTRIES.map(({ id, Logo, markClass, caseStudyHref }) => (
          <div className="hero__logo-cell" key={id}>
            <a
              className={`hero__logo-mark ${markClass}`}
              href={caseStudyHref ? withBasePath(caseStudyHref) : "#"}
              onClick={() => track("hero_logo_clicked", { slug: id })}
            >
              <Logo />
            </a>
            <span className="hero__logo-label">Case study</span>
          </div>
        ))}
      </div>
    </div>
  );
}
