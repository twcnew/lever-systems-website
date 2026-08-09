"use client";

import { useRef } from "react";
import type { PlayMotion } from "@/lib/playsContent";
import { usePlaysMosaicFlow } from "@/hooks/usePlaysMosaicFlow";
import { GtmLogoTiles } from "./GtmLogoTiles";

function FlowLink() {
  return (
    <div className="plays-flow__link" aria-hidden="true">
      <span className="plays-flow__link-line" />
      <span className="plays-flow__link-cap" />
    </div>
  );
}

function FlowColumn({ motion }: { motion: PlayMotion }) {
  return (
    <article className="plays-flow__col">
      <h3 className="plays-flow__title">{motion.title}</h3>

      <div className="plays-flow__scene">
        <div className="plays-flow__stack">
          <div className="plays-flow__progress" aria-hidden="true">
            <span className="plays-flow__progress-fill" />
            <span className="plays-flow__progress-knob" />
          </div>

          <div className="plays-flow__panel plays-flow__beat" data-flow-beat="inputs">
            <div className="plays-flow__panel-hd">
              <span className="plays-flow__panel-dot" />
              <span className="plays-flow__panel-label">Inputs</span>
              <span className="plays-flow__panel-dot" />
            </div>
            <div className="plays-flow__panel-body plays-flow__inputs">
              {motion.inputs.map((input) => (
                <span className="plays-flow__chip" key={input}>
                  {input}
                </span>
              ))}
            </div>
          </div>

          <FlowLink />

          <div className="plays-flow__nodes">
            {motion.steps.map((step) => (
              <div
                className="plays-flow__node plays-flow__beat"
                data-flow-beat="step"
                key={step.label}
              >
                <span className="plays-flow__node-label">{step.label}</span>
                <GtmLogoTiles logos={step.tools} />
              </div>
            ))}
          </div>

          <FlowLink />

          <div
            className="plays-flow__panel plays-flow__panel--out plays-flow__beat"
            data-flow-beat="outputs"
          >
            <div className="plays-flow__panel-hd">
              <span className="plays-flow__panel-dot" />
              <span className="plays-flow__panel-label">Routing</span>
              <span className="plays-flow__panel-dot" />
            </div>
            <div className="plays-flow__panel-body plays-flow__outputs">
              {motion.outputs.map((output) => (
                <div className="plays-flow__out" key={output.label}>
                  <span className="plays-flow__out-seq">{output.n}</span>
                  <span className="plays-flow__out-copy">
                    <span className="plays-flow__out-label">{output.label}</span>
                    <span className="plays-flow__out-detail">{output.detail}</span>
                  </span>
                  {output.logos && output.logos.length > 0 && (
                    <GtmLogoTiles logos={output.logos} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

type PlaysMosaicDiagramProps = {
  motions: PlayMotion[];
};

export function PlaysMosaicDiagram({ motions }: PlaysMosaicDiagramProps) {
  const rootRef = useRef<HTMLElement>(null);
  usePlaysMosaicFlow({ rootRef });

  return (
    <figure className="plays-flow rev-engine" aria-label="GTM plays by channel" ref={rootRef}>
      <div className="plays-flow__grid">
        {motions.map((motion) => (
          <FlowColumn motion={motion} key={motion.slug} />
        ))}
      </div>
    </figure>
  );
}
