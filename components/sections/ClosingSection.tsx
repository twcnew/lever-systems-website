"use client";

import { LazyClosingCalEmbed } from "../lp/LazyClosingCalEmbed";
import { LpModule } from "../lp/LpModule";
import { InkAnnotate } from "../system/InkAnnotate";
import {
  CLOSING_CONTENT,
  CLOSING_TITLE_ACCENT_ANNOTATED,
  CLOSING_TITLE_ACCENT_NOTE,
} from "@/lib/closingContent";

function annotatedTitleAccent(titleAccent: string) {
  if (!titleAccent.includes(CLOSING_TITLE_ACCENT_ANNOTATED)) {
    return titleAccent;
  }

  const before = titleAccent.slice(
    0,
    titleAccent.indexOf(CLOSING_TITLE_ACCENT_ANNOTATED),
  );
  const after = titleAccent.slice(
    titleAccent.indexOf(CLOSING_TITLE_ACCENT_ANNOTATED) + CLOSING_TITLE_ACCENT_ANNOTATED.length,
  );

  return (
    <>
      {before}
      <InkAnnotate
        variant="underline"
        note={CLOSING_TITLE_ACCENT_NOTE}
        noteDuration={1.4}
      >
        {CLOSING_TITLE_ACCENT_ANNOTATED}
      </InkAnnotate>
      {after}
    </>
  );
}

export function ClosingSection() {
  const { label, title, titleAccent, sub } = CLOSING_CONTENT;

  return (
    <LpModule
      id="contact"
      className="lp-module--closing"
      label={label}
      title={title}
      titleAccent={titleAccent ? annotatedTitleAccent(titleAccent) : undefined}
      sub={sub}
    >
      <LazyClosingCalEmbed />
    </LpModule>
  );
}
