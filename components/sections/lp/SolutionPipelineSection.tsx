"use client";

import { LpModule } from "../../lp/LpModule";
import { ClaudeConfettiMark } from "../../system/ClaudeConfettiMark";
import { InkAnnotate } from "../../system/InkAnnotate";
import { InkCta } from "../../system/InkCta";
import { LeverOwnerCard } from "../../system/LeverOwnerCard";
import { SolutionPipelineDiagram } from "../../system/SolutionPipelineDiagram";
import {
  SOLUTION_CONTENT,
  SOLUTION_SUB_ANNOTATED,
  SOLUTION_TITLE_ACCENT_ANNOTATED,
} from "@/lib/solutionContent";

function annotatedTitleAccent(titleAccent: string) {
  if (!titleAccent.includes(SOLUTION_TITLE_ACCENT_ANNOTATED)) {
    return titleAccent;
  }

  const before = titleAccent.slice(
    0,
    titleAccent.indexOf(SOLUTION_TITLE_ACCENT_ANNOTATED),
  );
  const after = titleAccent.slice(
    titleAccent.indexOf(SOLUTION_TITLE_ACCENT_ANNOTATED) +
      SOLUTION_TITLE_ACCENT_ANNOTATED.length,
  );

  return (
    <>
      {before}
      <InkAnnotate variant="circle">{SOLUTION_TITLE_ACCENT_ANNOTATED}</InkAnnotate>
      {after}
    </>
  );
}

function annotatedSub(sub: string) {
  if (!sub.includes(SOLUTION_SUB_ANNOTATED)) {
    return sub;
  }

  const before = sub.slice(0, sub.indexOf(SOLUTION_SUB_ANNOTATED));
  const after = sub.slice(sub.indexOf(SOLUTION_SUB_ANNOTATED) + SOLUTION_SUB_ANNOTATED.length);

  return (
    <>
      {before}
      <InkAnnotate variant="circle">{SOLUTION_SUB_ANNOTATED}</InkAnnotate>
      {after}
    </>
  );
}

export function SolutionPipelineSection() {
  const { label, title, titleAccent, sub, founder, pillars, steps, cta } = SOLUTION_CONTENT;

  return (
    <LpModule
      id="solution"
      className="lp-module--solution-pipeline"
      label={label}
      title={title}
      titleAccent={titleAccent ? annotatedTitleAccent(titleAccent) : undefined}
      sub={annotatedSub(sub)}
    >
      <div className="solution-panel">
        <div className="solution-panel__owner">
          <LeverOwnerCard founder={founder} pillars={pillars} showMascot={false} variant="panel" />
        </div>
        <div className="solution-panel__pipeline">
          <div className="solution-panel__mascot" aria-hidden="true">
            <ClaudeConfettiMark className="solution-panel__mascot-svg" />
          </div>
          <SolutionPipelineDiagram steps={steps} />
        </div>
      </div>
      {cta && (
        <div className="solution-ink-cta">
          <InkCta href={cta.href}>{cta.label}</InkCta>
        </div>
      )}
    </LpModule>
  );
}
