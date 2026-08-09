"use client";

import { useRef } from "react";
import { useExperience } from "@/lib/useExperience";
import { Drawer, TopNav } from "./Chrome";
import { HeroBackdrop } from "./HeroBackdrop";
import { LpBackdrop } from "./LpBackdrop";
import { SplitText, type Segment } from "./SplitText";
import { HeroLogoStrip } from "./HeroLogoStrip";
import { HeroPillAvatar } from "./HeroPillAvatar";
import { VideoCall } from "./icons";
import { ProblemSection } from "./sections/lp/ProblemSection";
import { SolutionPipelineSection } from "./sections/lp/SolutionPipelineSection";
import { SolutionSection } from "./sections/lp/SolutionSection";
import { StackStripSection } from "./sections/lp/StackStripSection";
import { PlaysSection } from "./sections/lp/PlaysSection";
import { ProofSection } from "./sections/lp/ProofSection";
import { FaqSection } from "./sections/FaqSection";
import { ClosingSection } from "./sections/ClosingSection";
import { SiteFooter } from "./lp/SiteFooter";
import { ABOUT_CONTENT } from "@/lib/aboutContent";

const SUB_LINES = [
  "One GTM engineer who turns your market's signals into booked meetings, inside your own stack.",
];

export function LumioHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  useExperience(rootRef);

  return (
    <div ref={rootRef}>
      <TopNav />
      <Drawer />

      {/* Curtain: fixed hero that slides away on first scroll (desktop). */}
      <div className="stage" data-stage>
        <HeroBackdrop />
        <div className="stage__vignette" aria-hidden="true" />

        <section className="hero">
          <a
            className="hero__pill"
            data-pill
            href={ABOUT_CONTENT.founder.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${ABOUT_CONTENT.founder.name} on LinkedIn`}
          >
            <HeroPillAvatar />
            <span className="label">{ABOUT_CONTENT.founder.role}</span>
          </a>
          <SplitText
            as="h1"
            className="hero__title"
            step={28}
            segments={[
              { text: "Building personalized AI systems" },
              { text: "for your ", className: "row2", breakBefore: true },
              { text: "GTM team.", className: "row2 accent" },
            ] satisfies Segment[]}
          />
          <p className="hero__sub" data-sub>
            {SUB_LINES.map((line) => (
              <span className="sub-row" key={line}>
                {line}
              </span>
            ))}
          </p>
          <div className="hero__ctas" data-ctas>
            <a className="btn btn-solid" href="#contact">
              <span>Book a Strategy Call</span>
              <VideoCall />
            </a>
          </div>

          <HeroLogoStrip />
        </section>

        <div className="stage__lip" aria-hidden="true" />
      </div>

      {/* Deck: LP content revealed behind the curtain. */}
      <main className="deck" data-deck>
        <div className="deck__panel deck__panel--ghost" aria-hidden="true" />
        <div className="deck__panel deck__panel--flow">
          <div className="lp lp--clay">
            <LpBackdrop />
            <ProblemSection />
            <SolutionPipelineSection />
            <StackStripSection />
            <SolutionSection />
            <PlaysSection />
            <ProofSection />
            <FaqSection />
            <ClosingSection />
            <SiteFooter />
          </div>
        </div>
      </main>
    </div>
  );
}
