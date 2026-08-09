"use client";

import { useSectionReveal } from "../useSectionReveal";
import { WhatBreaksGrid } from "../../system/WhatBreaksGrid";
import { WHAT_BREAKS_CONTENT } from "@/lib/whatBreaksContent";

export function ProblemSection() {
  const ref = useSectionReveal<HTMLElement>();
  const { label, title, titleAccent, sub, cta } = WHAT_BREAKS_CONTENT;

  return (
    <section className="lp-module lp-module--problem" id="problem" ref={ref}>
      <div className="lp-module__inner">
        <WhatBreaksGrid
          label={label}
          title={title}
          titleAccent={titleAccent}
          sub={sub}
          cta={cta}
        />
      </div>
    </section>
  );
}
