"use client";

import { useRef } from "react";
import { REVENUE_ENGINE } from "@/lib/revenueEngineContent";
import { useRevenueEngineWires } from "@/hooks/useRevenueEngineWires";
import { ClaudeGymMark } from "./ClaudeGymMark";
import { GtmLogoTiles } from "./GtmLogoTiles";

export function RevenueEngineDiagram() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const wiresRef = useRef<SVGSVGElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);

  useRevenueEngineWires({ sceneRef, wiresRef, panelRef, lensRef });

  const {
    signalsTitle,
    engineTitle,
    outputsTitle,
    routingLabel,
    signals,
    steps,
    outputs,
  } = REVENUE_ENGINE;

  return (
    <figure className="rev-engine" aria-label="Revenue engine workflow diagram">
      <div className="rev-engine__card">
        <div className="rev-engine__scene" ref={sceneRef}>
          <svg
            className="rev-engine__wires"
            ref={wiresRef}
            aria-hidden="true"
            preserveAspectRatio="none"
          />

          <div className="rev-engine__col rev-engine__col-in">
            <div className="rev-engine__panel">
              <div className="rev-engine__colhd in">
                <span className="rev-engine__cnode" />
                <span className="rev-engine__cl">{signalsTitle}</span>
                <span className="rev-engine__cnode" />
              </div>
              <div className="rev-engine__prows">
                {signals.map((signal) => (
                  <div className="rev-engine__lrow rev-engine__in-row" key={signal.label}>
                    <span className="rev-engine__name">{signal.label}</span>
                    <GtmLogoTiles logos={signal.logos} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rev-engine__col rev-engine__col-engine">
            <div className="rev-engine__engine" ref={panelRef}>
              <div className="rev-engine__ecore">
                <div className="rev-engine__colhd engine-hd">
                  <span className="rev-engine__cnode w" />
                  <span className="rev-engine__cl">{engineTitle}</span>
                  <span className="rev-engine__cnode w" />
                </div>
                <ClaudeGymMark className="rev-engine__emark" />
                <div className="rev-engine__erouting">{routingLabel}</div>
              </div>

              <div className="rev-engine__esteps">
                <div
                  className="rev-engine__lens"
                  ref={lensRef}
                  aria-hidden="true"
                >
                  <span className="rev-engine__lens-scan" />
                </div>
                {steps.map((step) => (
                  <div
                    className={`rev-engine__erow${step.review ? " review" : ""}`}
                    key={step.short}
                  >
                    <span className="rev-engine__es">{step.short}</span>
                    {step.stamp ? (
                      <span className="rev-engine__estamp notch">{step.stamp}</span>
                    ) : (
                      <span className="rev-engine__ed">{step.detail}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rev-engine__col rev-engine__col-out">
            <div className="rev-engine__panel">
              <div className="rev-engine__colhd out">
                <span className="rev-engine__cnode o" />
                <span className="rev-engine__cl">{outputsTitle}</span>
                <span className="rev-engine__cnode o" />
              </div>
              <div className="rev-engine__prows">
                {outputs.map((output) => (
                  <div
                    className="rev-engine__lrow rev-engine__out-row"
                    key={output.label}
                  >
                    <span className="rev-engine__seq-n mono">{output.n}</span>
                    <span className="rev-engine__name rev-engine__out-name">
                      {output.label}
                    </span>
                    <GtmLogoTiles logos={output.logos} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
