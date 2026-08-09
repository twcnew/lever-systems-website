"use client";

import { useEffect } from "react";
import { Drawer, TopNav } from "./Chrome";
import { ClosingSection } from "./sections/ClosingSection";
import { SiteFooter } from "./lp/SiteFooter";
import { LpModule } from "./lp/LpModule";
import { ProofShowcase } from "./system/ProofShowcase";
import { InkAnnotate } from "./system/InkAnnotate";
import { UseCasesNavTheme } from "./UseCasesNavTheme";
import {
  USE_CASES_INDEX_CONTENT,
  USE_CASES_INDEX_TITLE_ACCENT,
} from "@/lib/useCasesIndexContent";

function annotatedTitleAccent(titleAccent: string) {
  if (!titleAccent.includes(USE_CASES_INDEX_TITLE_ACCENT)) {
    return titleAccent;
  }

  const before = titleAccent.slice(
    0,
    titleAccent.indexOf(USE_CASES_INDEX_TITLE_ACCENT),
  );
  const after = titleAccent.slice(
    titleAccent.indexOf(USE_CASES_INDEX_TITLE_ACCENT) +
      USE_CASES_INDEX_TITLE_ACCENT.length,
  );

  return (
    <>
      {before}
      <InkAnnotate variant="underline">{USE_CASES_INDEX_TITLE_ACCENT}</InkAnnotate>
      {after}
    </>
  );
}

export function UseCasesPage() {
  const { label, title, titleAccent, sub } = USE_CASES_INDEX_CONTENT;

  useEffect(() => {
    document.documentElement.classList.add("js");
    document.documentElement.classList.remove("no-js");
  }, []);

  return (
    <>
      <UseCasesNavTheme />
      <TopNav />
      <Drawer />

      <main id="main" className="use-cases-index">
        <div className="lp lp--clay">
          <LpModule
            id="customers"
            className="lp-module--proof use-cases-index__intro"
            label={label}
            title={title}
            titleAccent={
              titleAccent ? annotatedTitleAccent(titleAccent) : undefined
            }
            sub={sub}
          >
            <ProofShowcase layout="grid" body="overview" />
          </LpModule>
        </div>

        <div className="lp lp--clay cs-closing-band">
          <ClosingSection />
          <SiteFooter />
        </div>
      </main>
    </>
  );
}
