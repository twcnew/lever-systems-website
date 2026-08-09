"use client";

import { LpModule } from "../../lp/LpModule";
import { InkAnnotate } from "../../system/InkAnnotate";
import { InkCta } from "../../system/InkCta";
import { PlaysMosaicDiagram } from "../../system/PlaysMosaicDiagram";
import {
  PLAYS_CONTENT,
  PLAYS_SUB_ANNOTATED,
  PLAYS_TITLE_ACCENT_ANNOTATED,
} from "@/lib/playsContent";

function annotatedTitleAccent(titleAccent: string) {
  if (!titleAccent.includes(PLAYS_TITLE_ACCENT_ANNOTATED)) {
    return titleAccent;
  }

  const before = titleAccent.slice(
    0,
    titleAccent.indexOf(PLAYS_TITLE_ACCENT_ANNOTATED),
  );
  const after = titleAccent.slice(
    titleAccent.indexOf(PLAYS_TITLE_ACCENT_ANNOTATED) + PLAYS_TITLE_ACCENT_ANNOTATED.length,
  );

  return (
    <>
      {before}
      <InkAnnotate variant="underline">{PLAYS_TITLE_ACCENT_ANNOTATED}</InkAnnotate>
      {after}
    </>
  );
}

function annotatedSub(sub: string) {
  if (!sub.includes(PLAYS_SUB_ANNOTATED)) {
    return sub;
  }

  const before = sub.slice(0, sub.indexOf(PLAYS_SUB_ANNOTATED));
  const after = sub.slice(sub.indexOf(PLAYS_SUB_ANNOTATED) + PLAYS_SUB_ANNOTATED.length);

  return (
    <>
      {before}
      <InkAnnotate variant="underline" multiline>
        {PLAYS_SUB_ANNOTATED}
      </InkAnnotate>
      {after}
    </>
  );
}

export function PlaysSection() {
  const { label, title, titleAccent, sub, motions, cta } = PLAYS_CONTENT;

  return (
    <LpModule
      id="plays"
      className="lp-module--plays"
      label={label}
      title={title}
      titleAccent={titleAccent ? annotatedTitleAccent(titleAccent) : undefined}
      sub={sub ? annotatedSub(sub) : undefined}
    >
      <PlaysMosaicDiagram motions={motions} />
      {cta && (
        <div className="plays-ink-cta">
          <InkCta href={cta.href}>{cta.label}</InkCta>
        </div>
      )}
    </LpModule>
  );
}
