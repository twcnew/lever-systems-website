"use client";

import { useRef } from "react";
import { Brand } from "@/components/icons";
import { ABOUT_CONTENT } from "@/lib/aboutContent";
import { withBasePath } from "@/lib/basePath";
import { usePyramidFlow } from "@/hooks/usePyramidFlow";
import {
  PYRAMID_APEX,
  PYRAMID_CTA,
  PYRAMID_CTA_ACCENT,
  PYRAMID_KICKER,
  PYRAMID_KICKER_ACCENT,
  PYRAMID_LAYERS,
  PYRAMID_LEFT,
  PYRAMID_RIGHT,
  PYRAMID_TITLE,
  PYRAMID_TITLE_ACCENT,
  type PyramidLayer,
} from "@/lib/studio/gtmPyramid";

const CIRCLED = ["①", "②", "③", "④", "⑤"];

function accentSpan(text: string, accent?: string) {
  if (!accent || !text.includes(accent)) return text;
  const index = text.indexOf(accent);
  return (
    <>
      {text.slice(0, index)}
      <span className="pyramid-glass__accent">{accent}</span>
      {text.slice(index + accent.length)}
    </>
  );
}

function Band({ layer }: { layer: PyramidLayer }) {
  return (
    <div
      className={`pyramid-glass__band pyramid-glass__band--${layer.level}`}
      data-step={layer.level}
    >
      <div className="pyramid-glass__band-head">
        <span className="pyramid-glass__band-num">{CIRCLED[layer.level - 1]}</span>
        <div className="pyramid-glass__band-titles">
          <span className="pyramid-glass__band-label">{layer.label}</span>
          <span className="pyramid-glass__band-sub">{layer.subtitle}</span>
        </div>
      </div>
      <div className="pyramid-glass__band-items">
        {layer.items.map((item) => (
          <span key={item.title} className="pyramid-glass__chip">
            {item.title}
          </span>
        ))}
      </div>
    </div>
  );
}

export function GtmPyramidAsset() {
  const stageRef = useRef<HTMLDivElement>(null);
  usePyramidFlow(stageRef);
  return (
    <div className="pyramid-glass">
      <div className="spine-glass__aurora" aria-hidden="true" />
      <div className="spine-glass__grain" aria-hidden="true" />

      <span className="spine-glass__url" aria-hidden="true">
        lever.systems
      </span>

      <header className="spine-glass__topbar">
        <div className="spine-glass__byline">
          <img
            className="spine-glass__avatar"
            src={withBasePath(ABOUT_CONTENT.founder.avatarPhoto)}
            alt={ABOUT_CONTENT.founder.name}
            width={48}
            height={48}
          />
          <span className="spine-glass__name">{ABOUT_CONTENT.founder.name}</span>
          <span className="spine-glass__dot" aria-hidden="true">
            ·
          </span>
          <span className="spine-glass__role">{ABOUT_CONTENT.founder.role}</span>
          <Brand className="spine-glass__wordmark" />
        </div>
      </header>

      <header className="pyramid-glass__hero">
        <h1 className="pyramid-glass__title">
          {accentSpan(PYRAMID_TITLE, PYRAMID_TITLE_ACCENT)}
        </h1>
        <p className="pyramid-glass__kicker">
          {accentSpan(PYRAMID_KICKER, PYRAMID_KICKER_ACCENT)}
        </p>
      </header>

      <div className="pyramid-glass__monolith" ref={stageRef}>
        <div className="pyramid-glass__capstone">
          <span className="pyramid-glass__cap-star">★</span>
          <span className="pyramid-glass__cap-label">{PYRAMID_APEX}</span>
        </div>
        {[...PYRAMID_LAYERS].reverse().map((layer) => (
          <Band key={layer.id} layer={layer} />
        ))}
      </div>

      <div className="pyramid-glass__closer">
        {accentSpan(PYRAMID_CTA, PYRAMID_CTA_ACCENT)}
      </div>

      <div className="pyramid-glass__principles">
        <div className="pyramid-glass__princ-col">
          {PYRAMID_LEFT.map((r) => (
            <div key={r.rule} className="pyramid-glass__princ">
              <span className="pyramid-glass__princ-rule">{r.rule}</span>
              <span className="pyramid-glass__princ-sub">{r.sub}</span>
            </div>
          ))}
        </div>
        <div className="pyramid-glass__princ-col">
          {PYRAMID_RIGHT.map((r) => (
            <div key={r.rule} className="pyramid-glass__princ">
              <span className="pyramid-glass__princ-rule">{r.rule}</span>
              <span className="pyramid-glass__princ-sub">{r.sub}</span>
            </div>
          ))}
        </div>
      </div>

      <img
        className="spine-glass__bust-corner"
        src={withBasePath(ABOUT_CONTENT.founder.footerPhoto)}
        alt={ABOUT_CONTENT.founder.name}
        aria-hidden="true"
      />
    </div>
  );
}
