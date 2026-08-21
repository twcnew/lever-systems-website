"use client";

import { Brand } from "@/components/icons";
import { ABOUT_CONTENT } from "@/lib/aboutContent";
import { withBasePath } from "@/lib/basePath";
import {
  FUNNEL_KICKER,
  FUNNEL_KICKER_ACCENT,
  FUNNEL_TITLE,
  FUNNEL_TITLE_ACCENT,
  GTM_FUNNEL,
  type FunnelStage,
} from "@/lib/studio/gtmFunnel";

function accentSpan(text: string, accent?: string) {
  if (!accent || !text.includes(accent)) return text;
  const index = text.indexOf(accent);
  return (
    <>
      {text.slice(0, index)}
      <span className="funnel-glass__accent">{accent}</span>
      {text.slice(index + accent.length)}
    </>
  );
}

function Stage({ stage }: { stage: FunnelStage }) {
  return (
    <div className={`funnel-glass__stage funnel-glass__stage--${stage.id}`}>
      <div className="funnel-glass__stage-head">
        <span className="funnel-glass__stage-name">{stage.label}</span>
        <span className="funnel-glass__stage-sub">{stage.sublabel}</span>
      </div>
      <div className="funnel-glass__columns">
        {stage.columns.map((column) => (
          <div key={column.id} className="funnel-glass__column">
            <span className="funnel-glass__column-label">{column.label}</span>
            <span className="funnel-glass__column-logos">
              {column.tools.map((tool) => (
                <span key={tool.id} className="funnel-glass__logo">
                  <img
                    src={withBasePath(tool.src)}
                    alt={tool.label}
                    width={20}
                    height={20}
                  />
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GtmFunnelAsset() {
  return (
    <div className="funnel-glass">
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

      <header className="funnel-glass__hero">
        <h1 className="funnel-glass__title">
          {accentSpan(FUNNEL_TITLE, FUNNEL_TITLE_ACCENT)}
        </h1>
        <p className="funnel-glass__kicker">
          {accentSpan(FUNNEL_KICKER, FUNNEL_KICKER_ACCENT)}
        </p>
      </header>

      <div className="funnel-glass__funnel">
        {GTM_FUNNEL.map((stage) => (
          <Stage key={stage.id} stage={stage} />
        ))}
      </div>

      <img
        className="spine-glass__bust-corner"
        src={withBasePath(ABOUT_CONTENT.founder.footerPhoto)}
        alt={ABOUT_CONTENT.founder.name}
        width={900}
        height={824}
      />
    </div>
  );
}
