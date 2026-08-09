"use client";

import { LpModule } from "../../lp/LpModule";
import { InkAnnotate } from "../../system/InkAnnotate";
import { InkCta } from "../../system/InkCta";
import { RevenueEngineDiagram } from "../../system/RevenueEngineDiagram";
import { SYSTEM_CONTENT, SYSTEM_TITLE_ACCENT_ANNOTATED } from "@/lib/systemContent";

function annotatedTitleAccent(titleAccent: string) {
  if (!titleAccent.includes(SYSTEM_TITLE_ACCENT_ANNOTATED)) {
    return titleAccent;
  }

  const before = titleAccent.slice(
    0,
    titleAccent.indexOf(SYSTEM_TITLE_ACCENT_ANNOTATED),
  );
  const after = titleAccent.slice(
    titleAccent.indexOf(SYSTEM_TITLE_ACCENT_ANNOTATED) +
      SYSTEM_TITLE_ACCENT_ANNOTATED.length,
  );

  return (
    <>
      {before}
      <InkAnnotate variant="underline">{SYSTEM_TITLE_ACCENT_ANNOTATED}</InkAnnotate>
      {after}
    </>
  );
}

function annotatedSub(sub: string) {
  const match = sub.match(/^([^:]+:\s*)(.+)$/);
  if (!match) {
    return sub;
  }

  const [, lead, tail] = match;

  return (
    <>
      {lead}
      <InkAnnotate variant="underline" multiline>
        {tail}
      </InkAnnotate>
    </>
  );
}

export function SolutionSection() {
  const { label, title, titleAccent, sub, cta } = SYSTEM_CONTENT;

  return (
    <LpModule
      id="how"
      className="lp-module--solution"
      label={label}
      title={title}
      titleAccent={titleAccent ? annotatedTitleAccent(titleAccent) : undefined}
      sub={annotatedSub(sub)}
    >
      <RevenueEngineDiagram />
      {cta && (
        <div className="how-ink-cta">
          <InkCta href={cta.href}>{cta.label}</InkCta>
        </div>
      )}
    </LpModule>
  );
}
