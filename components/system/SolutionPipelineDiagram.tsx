"use client";

import { useRef } from "react";
import type { SolutionStep, SolutionStepIcon } from "@/lib/solutionContent";
import { useSolutionPipelineHighlight } from "@/hooks/useSolutionPipelineHighlight";

function StepIcon({ icon }: { icon: SolutionStepIcon }) {
  switch (icon) {
    case "signal":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 12 19 7" strokeLinecap="round" />
          <circle cx="16" cy="9" r="1.25" fill="currentColor" stroke="none" />
        </svg>
      );
    case "enrichment":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <ellipse cx="12" cy="6" rx="7" ry="3" />
          <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
          <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
        </svg>
      );
    case "verification":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M12 3 4 7v5c0 5 3.4 7.7 8 9 4.6-1.3 8-4 8-9V7l-8-4Z" />
          <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "outreach":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="m3 8 9 6 9-6" />
        </svg>
      );
    case "meeting":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" strokeLinecap="round" />
          <path d="M9 14h2v2H9z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "revenue":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 6v12" strokeLinecap="round" />
          <path
            d="M14.5 8.5H10.5c-1 0-1.75.65-1.75 1.5S9.5 11.5 10.5 11.5H13.5c1.4 0 2.5.9 2.5 2s-1.1 2-2.5 2H9.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

type SolutionPipelineDiagramProps = {
  steps: SolutionStep[];
};

export function SolutionPipelineDiagram({ steps }: SolutionPipelineDiagramProps) {
  const rootRef = useRef<HTMLElement>(null);
  useSolutionPipelineHighlight({ rootRef });

  return (
    <figure className="sol-pipe" ref={rootRef} aria-label="Revenue pipeline workflow">
      <div className="sol-pipe__frame">
        <ol className="sol-pipe__steps">
          {steps.map((step) => (
            <li
              className={`sol-pipe__step${step.defaultActive ? " is-active" : ""}`}
              data-default={step.defaultActive ? "true" : undefined}
              key={step.id}
            >
              <div className="sol-pipe__card">
                <span className="sol-pipe__icon">
                  <StepIcon icon={step.icon} />
                </span>
                <span className="sol-pipe__label">{step.label}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}
