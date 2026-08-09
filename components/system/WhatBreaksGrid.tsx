"use client";

import { useRef } from "react";
import { ClaudePeekMark } from "./ClaudePeekMark";
import { InkAnnotate } from "./InkAnnotate";
import { InkCta } from "./InkCta";
import { PROBLEM_PILLARS } from "@/lib/whatBreaksContent";
import { WhatBreaksScene } from "./WhatBreaksScene";

const TITLE_ACCENT_ANNOTATED = "isn't a system.";
const SUB_ANNOTATED = "low-value work";

export function WhatBreaksGrid({
  label,
  title,
  titleAccent,
  sub,
  cta,
}: {
  label?: string;
  title?: string;
  titleAccent?: string;
  sub?: string;
  cta?: { label: string; href: string };
} = {}) {
  const figureRef = useRef<HTMLElement>(null);

  return (
    <figure className="what-breaks" aria-label="Pipeline costs without a system" ref={figureRef}>
      {(title || label || sub) && (
        <div className="what-breaks__header-pin">
          <div className="lp-module__copy">
            {label && <span className="lp-module__label">{label}</span>}
            {title && (
              <h2 className="lp-module__title">
                {title}
                {titleAccent && (
                  <>
                    <br />
                    <span className="lp-module__title-accent">
                      {titleAccent.includes(TITLE_ACCENT_ANNOTATED) ? (
                        <>
                          {titleAccent.slice(0, titleAccent.indexOf(TITLE_ACCENT_ANNOTATED))}
                          <InkAnnotate
                            variant="underline"
                            note="No system = less revenue."
                            multiline
                          >
                            {TITLE_ACCENT_ANNOTATED}
                          </InkAnnotate>
                        </>
                      ) : (
                        titleAccent
                      )}
                    </span>
                  </>
                )}
              </h2>
            )}
            {sub && (
              <p className="lp-module__sub">
                {sub.includes(SUB_ANNOTATED) ? (
                  <>
                    {sub.slice(0, sub.indexOf(SUB_ANNOTATED))}
                    <InkAnnotate variant="underline">{SUB_ANNOTATED}</InkAnnotate>
                    {sub.slice(sub.indexOf(SUB_ANNOTATED) + SUB_ANNOTATED.length)}
                  </>
                ) : (
                  sub
                )}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="what-breaks__stage">
        <div className="what-breaks__bento">
          {PROBLEM_PILLARS.map((pillar, index) => (
            <div className="what-breaks__slot" key={pillar.id}>
              {index > 0 && <div className="what-breaks__rule" aria-hidden="true" />}
              <article
                className={`what-breaks__cell what-breaks__cell--d${index + 1}`}
              >
                {index === 2 && (
                  <div className="what-breaks__cell-mascot" aria-hidden="true">
                    <ClaudePeekMark className="what-breaks__cell-mascot-svg" />
                  </div>
                )}
                <div className="what-breaks__scene-wrap">
                  <WhatBreaksScene sceneId={pillar.sceneId} />
                </div>
                <div className="what-breaks__copy">
                  <h3 className="what-breaks__headline">{pillar.headline}</h3>
                  <p className="what-breaks__detail">{pillar.detail}</p>
                </div>
              </article>
            </div>
          ))}
        </div>
        {cta && (
          <div className="what-breaks__ink-cta">
            <InkCta href={cta.href}>{cta.label}</InkCta>
          </div>
        )}
      </div>
    </figure>
  );
}
