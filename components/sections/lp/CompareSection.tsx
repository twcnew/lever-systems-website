"use client";

import { LpModule } from "../../lp/LpModule";
import { LeverOwnerCard } from "../../system/LeverOwnerCard";
import { COMPARE_CONTENT } from "@/lib/compareContent";

export function CompareSection() {
  const { label, title, titleAccent, sub, founder, pillars } = COMPARE_CONTENT;

  return (
    <LpModule
      className="lp-module--compare"
      label={label}
      title={title}
      titleAccent={titleAccent}
      sub={sub}
    >
      <LeverOwnerCard founder={founder} pillars={pillars} />
    </LpModule>
  );
}
