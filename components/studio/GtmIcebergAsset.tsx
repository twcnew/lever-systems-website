"use client";

import { Brand } from "@/components/icons";
import { ABOUT_CONTENT } from "@/lib/aboutContent";
import { withBasePath } from "@/lib/basePath";
import {
  ICEBERG_KICKER,
  ICEBERG_KICKER_ACCENT,
  ICEBERG_PRINCIPLE,
  ICEBERG_SECTIONS,
  ICEBERG_TITLE,
  ICEBERG_TITLE_ACCENT,
  type IcebergSection,
} from "@/lib/studio/gtmIceberg";

function accentSpan(text: string, accent?: string) {
  if (!accent || !text.includes(accent)) return text;
  const index = text.indexOf(accent);
  return (
    <>
      {text.slice(0, index)}
      <span className="iceberg-glass__accent">{accent}</span>
      {text.slice(index + accent.length)}
    </>
  );
}

function Section({ section }: { section: IcebergSection }) {
  return (
    <div className={`iceberg-glass__layer iceberg-glass__layer--${section.id}`}>
      <span className="iceberg-glass__layer-head">
        <span className="iceberg-glass__layer-label">{section.label}</span>
        <span className="iceberg-glass__layer-tag">{section.tag}</span>
      </span>
      <span className="iceberg-glass__layer-items">
        {section.items.map((item) => (
          <span key={item} className="iceberg-glass__layer-item">
            {item}
          </span>
        ))}
      </span>
    </div>
  );
}

export function GtmIcebergAsset() {
  return (
    <div className="iceberg-glass">
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

      <header className="iceberg-glass__hero">
        <h1 className="iceberg-glass__title">
          {accentSpan(ICEBERG_TITLE, ICEBERG_TITLE_ACCENT)}
        </h1>
        <p className="iceberg-glass__kicker">
          {accentSpan(ICEBERG_KICKER, ICEBERG_KICKER_ACCENT)}
        </p>
      </header>

      <div className="iceberg-glass__scene">
        <div className="iceberg-glass__berg iceberg-glass__berg--above" aria-hidden="true" />
        <div className="iceberg-glass__berg iceberg-glass__berg--below" aria-hidden="true" />

        <div className="iceberg-glass__arrows">
          {ICEBERG_SECTIONS.map((section) => (
            <span
              key={section.id}
              className={`iceberg-glass__arrow iceberg-glass__arrow--${section.id}`}
            >
              {section.arrow}
            </span>
          ))}
        </div>

        <div className="iceberg-glass__layers">
          {ICEBERG_SECTIONS.map((section) => (
            <div key={section.id} className="iceberg-glass__layer-slot">
              {section.id === "surface" && (
                <div className="iceberg-glass__waterline" aria-hidden="true">
                  <span className="iceberg-glass__waterline-label">waterline</span>
                </div>
              )}
              <Section section={section} />
            </div>
          ))}
        </div>
      </div>

      <p className="iceberg-glass__principle">{ICEBERG_PRINCIPLE}</p>

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
