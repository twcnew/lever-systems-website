"use client";

import { Fragment } from "react";

/* ============================================================================
   SystemDiagram — clean line/mono system schematics used across the LP.
   These are intentional placeholders in the site's palette (steel/royal on
   canvas, hairline borders, mono labels). Meant to be refined later.
   Reveal is inherited from the parent .lp-module.is-live transitions.
   ========================================================================== */

/* ---------------------------------------------------------------- Flow ---- */

export type FlowStage = {
  label: string;
  items: string[];
};

type FlowGate = {
  label: string;
  note?: string;
};

type SystemFlowProps = {
  stages: FlowStage[];
  gate?: FlowGate;
  /** Insert the human-judgment gate after this stage index (0-based). */
  gateAfter?: number;
  caption?: string;
};

export function SystemFlow({ stages, gate, gateAfter, caption }: SystemFlowProps) {
  type Cell =
    | { kind: "stage"; stage: FlowStage }
    | { kind: "gate"; gate: FlowGate };

  const cells: Cell[] = [];
  const gateIndex = gateAfter ?? stages.length - 2;
  stages.forEach((stage, index) => {
    cells.push({ kind: "stage", stage });
    if (gate && index === gateIndex) cells.push({ kind: "gate", gate });
  });

  return (
    <figure className="sysd sysd--flow">
      <div className="sysd-flow__track">
        {cells.map((cell, index) => (
          <Fragment key={index}>
            {index > 0 && (
              <span className="sysd-link" aria-hidden="true">
                →
              </span>
            )}
            {cell.kind === "stage" ? (
              <div className="sysd-node sysd-node--stage">
                <span className="sysd-node__label">{cell.stage.label}</span>
                <ul className="sysd-node__items">
                  {cell.stage.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="sysd-node sysd-node--gate">
                <span className="sysd-node__eyebrow">Human</span>
                <span className="sysd-node__label">{cell.gate.label}</span>
                {cell.gate.note && (
                  <p className="sysd-node__note">{cell.gate.note}</p>
                )}
              </div>
            )}
          </Fragment>
        ))}
      </div>
      {caption && <figcaption className="sysd__caption">{caption}</figcaption>}
    </figure>
  );
}

/* ------------------------------------------------------------ Timeline ---- */

export type Milestone = {
  stamp: string;
  title: string;
  body?: string;
};

type SystemTimelineProps = {
  milestones: Milestone[];
  caption?: string;
  className?: string;
  beat?: boolean;
};

export function SystemTimeline({
  milestones,
  caption,
  className = "",
  beat = false,
}: SystemTimelineProps) {
  return (
    <figure className={`sysd sysd--timeline${className ? ` ${className}` : ""}`.trim()}>
      {beat && (
        <div className="sysd-timeline__rail" aria-hidden="true">
          <span className="sysd-timeline__rail-fill" />
        </div>
      )}
      <ol className="sysd-timeline__track">
        {milestones.map((milestone) => (
          <li
            className={`sysd-mile${beat ? " build-beat" : ""}`}
            key={milestone.stamp}
          >
            <span className="sysd-mile__dot" aria-hidden="true" />
            <span className="sysd-mile__stamp">{milestone.stamp}</span>
            <span className="sysd-mile__title">{milestone.title}</span>
            {milestone.body && (
              <span className="sysd-mile__body">{milestone.body}</span>
            )}
          </li>
        ))}
      </ol>
      {caption && <figcaption className="sysd__caption">{caption}</figcaption>}
    </figure>
  );
}

/* ---------------------------------------------------------------- Mini ---- */

type PlayFlowProps = {
  steps: string[];
};

export function PlayFlow({ steps }: PlayFlowProps) {
  return (
    <div className="sysd sysd--mini">
      <div className="sysd-mini__track">
        {steps.map((step, index) => {
          const isSignal = index === 0;
          const isOut = index === steps.length - 1;
          const cls = `sysd-mini__step${isSignal ? " is-signal" : ""}${
            isOut ? " is-out" : ""
          }`;
          return (
            <Fragment key={step}>
              {index > 0 && (
                <span className="sysd-mini__link" aria-hidden="true">
                  →
                </span>
              )}
              <span className={cls}>{step}</span>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Matrix ---- */

export type CompareOption = {
  name: string;
  highlight?: boolean;
  points: string[];
};

type CompareMatrixProps = {
  options: CompareOption[];
  caption?: string;
};

export function CompareMatrix({ options, caption }: CompareMatrixProps) {
  return (
    <figure className="sysd sysd--matrix">
      <div
        className="sysd-matrix__grid"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <div
            className={`sysd-col${option.highlight ? " is-primary" : ""}`}
            key={option.name}
          >
            <span className="sysd-col__name">{option.name}</span>
            <ul className="sysd-col__points">
              {option.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {caption && <figcaption className="sysd__caption">{caption}</figcaption>}
    </figure>
  );
}

/* ------------------------------------------------------------- Scatter ---- */

type SystemScatterProps = {
  nodes: string[];
  tag?: string;
  caption?: string;
};

export function SystemScatter({ nodes, tag = "manual glue", caption }: SystemScatterProps) {
  return (
    <figure className="sysd sysd--scatter">
      <div className="sysd-scatter__field">
        {nodes.map((node) => (
          <span className="sysd-scatter__chip" key={node}>
            {node}
          </span>
        ))}
        <span className="sysd-scatter__tag">{tag}</span>
      </div>
      {caption && <figcaption className="sysd__caption">{caption}</figcaption>}
    </figure>
  );
}
