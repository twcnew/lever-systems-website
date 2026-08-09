"use client";

import { LpModule } from "./lp/LpModule";
import { ProofShowcase } from "./system/ProofShowcase";
import { InkAnnotate } from "./system/InkAnnotate";
import { InkCta } from "./system/InkCta";
import {
  PROOF_CONTENT,
  PROOF_SUB_ANNOTATED,
  PROOF_TITLE_ACCENT_ANNOTATED,
} from "@/lib/proofContent";
import type { CaseStudy } from "@/lib/caseStudies/types";

type CaseStudyRelatedProps = {
  study: CaseStudy;
};

function annotatedTitleAccent(titleAccent: string) {
  if (!titleAccent.includes(PROOF_TITLE_ACCENT_ANNOTATED)) {
    return titleAccent;
  }

  const before = titleAccent.slice(
    0,
    titleAccent.indexOf(PROOF_TITLE_ACCENT_ANNOTATED),
  );
  const after = titleAccent.slice(
    titleAccent.indexOf(PROOF_TITLE_ACCENT_ANNOTATED) +
      PROOF_TITLE_ACCENT_ANNOTATED.length,
  );

  return (
    <>
      {before}
      <InkAnnotate variant="underline">{PROOF_TITLE_ACCENT_ANNOTATED}</InkAnnotate>
      {after}
    </>
  );
}

function annotatedSub(sub: string) {
  if (!sub.includes(PROOF_SUB_ANNOTATED)) {
    return sub;
  }

  const before = sub.slice(0, sub.indexOf(PROOF_SUB_ANNOTATED));
  const after = sub.slice(
    sub.indexOf(PROOF_SUB_ANNOTATED) + PROOF_SUB_ANNOTATED.length,
  );

  return (
    <>
      {before}
      <InkAnnotate variant="underline">{PROOF_SUB_ANNOTATED}</InkAnnotate>
      {after}
    </>
  );
}

export function CaseStudyRelated({ study }: CaseStudyRelatedProps) {
  const { label, title, titleAccent, sub, cta } = PROOF_CONTENT;

  return (
    <div className="lp lp--clay cs-related-band">
      <LpModule
        id="related-proof"
        className="lp-module--proof cs-related-proof"
        label={label}
        title={title}
        titleAccent={titleAccent ? annotatedTitleAccent(titleAccent) : undefined}
        sub={sub ? annotatedSub(sub) : undefined}
      >
        <ProofShowcase excludeSlug={study.slug} />
        {cta && (
          <div className="proof-ink-cta">
            <InkCta href={cta.href}>{cta.label}</InkCta>
          </div>
        )}
      </LpModule>
    </div>
  );
}
