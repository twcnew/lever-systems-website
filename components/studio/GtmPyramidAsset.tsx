"use client";

import { useRef, type CSSProperties } from "react";
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
  PYRAMID_SIDE_NOTES,
  PYRAMID_TITLE,
  PYRAMID_TITLE_ACCENT,
  type PyramidLayer,
} from "@/lib/studio/gtmPyramid";

type PyramidCssProperties = CSSProperties &
  Record<`--${string}`, string | number | undefined>;

const PYRAMID_GEOMETRY = {
  bandHeightCqw: 13.35,
  bandGapCqw: 1.5,
  bandWidthStepRatio: 0.16,
  cardSafetyInsetOfMonolithRatio: 0.0015,
  monolithWidthRatio: 0.88,
  bandWidths: {
    5: 0.36,
    4: 0.52,
    3: 0.68,
    2: 0.84,
    1: 1,
  },
} as const satisfies {
  bandHeightCqw: number;
  bandGapCqw: number;
  bandWidthStepRatio: number;
  cardSafetyInsetOfMonolithRatio: number;
  monolithWidthRatio: number;
  bandWidths: Record<PyramidLayer["level"], number>;
};

const BAND_SIDE_INSET_OF_MONOLITH_RATIO =
  (PYRAMID_GEOMETRY.bandWidthStepRatio / 2) *
  (PYRAMID_GEOMETRY.bandHeightCqw /
    (PYRAMID_GEOMETRY.bandHeightCqw + PYRAMID_GEOMETRY.bandGapCqw));

const CARD_INSET_OF_MONOLITH_RATIO =
  BAND_SIDE_INSET_OF_MONOLITH_RATIO +
  PYRAMID_GEOMETRY.cardSafetyInsetOfMonolithRatio;

const BAND_VIEWBOX = {
  width: 1000,
  height: 200,
  radius: 18,
} as const;

const MONOLITH_STYLE = {
  "--pyramid-band-height": `${PYRAMID_GEOMETRY.bandHeightCqw}cqw`,
  "--pyramid-band-gap": `${PYRAMID_GEOMETRY.bandGapCqw}cqw`,
  "--pyramid-monolith-width": `${PYRAMID_GEOMETRY.monolithWidthRatio * 100}%`,
} as PyramidCssProperties;

function bandStyle(level: PyramidLayer["level"]): PyramidCssProperties {
  const bandWidth = PYRAMID_GEOMETRY.bandWidths[level];

  return {
    "--band-w": `${bandWidth * 100}%`,
    // Percentage padding resolves against the monolith containing block, not
    // against the narrower band itself. Keep this value in monolith space.
    "--band-content-inset": `${CARD_INSET_OF_MONOLITH_RATIO * 100}%`,
  };
}

function bandTopInset(level: PyramidLayer["level"]) {
  return (
    (BAND_SIDE_INSET_OF_MONOLITH_RATIO /
      PYRAMID_GEOMETRY.bandWidths[level]) *
    BAND_VIEWBOX.width
  );
}

function roundedTrapezoidPath(level: PyramidLayer["level"]) {
  const inset = bandTopInset(level);
  const { width, height, radius } = BAND_VIEWBOX;
  const sideXAtY = (y: number) => inset * (1 - y / height);
  const upperSideX = sideXAtY(radius);
  const lowerSideX = sideXAtY(height - radius);

  return [
    `M ${inset + radius} 0`,
    `H ${width - inset - radius}`,
    `Q ${width - inset} 0 ${width - upperSideX} ${radius}`,
    `L ${width - lowerSideX} ${height - radius}`,
    `Q ${width} ${height} ${width - radius} ${height}`,
    `H ${radius}`,
    `Q 0 ${height} ${lowerSideX} ${height - radius}`,
    `L ${upperSideX} ${radius}`,
    `Q ${inset} 0 ${inset + radius} 0`,
    "Z",
  ].join(" ");
}

function BandSurface({ level }: { level: PyramidLayer["level"] }) {
  const gradientId = `pyramid-band-sheen-${level}`;
  const path = roundedTrapezoidPath(level);

  return (
    <svg
      className="pyramid-glass__band-surface"
      viewBox="0 0 1000 200"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(255, 255, 255, .12)" />
          <stop offset=".38" stopColor="rgba(255, 255, 255, .035)" />
          <stop offset="1" stopColor="rgba(255, 255, 255, 0)" />
        </linearGradient>
      </defs>
      <path
        className="pyramid-glass__band-shape"
        d={path}
        vectorEffect="non-scaling-stroke"
      />
      <path
        className="pyramid-glass__band-sheen"
        d={path}
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}

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
  const labelId = `pyramid-layer-${layer.level}`;

  return (
    <section
      className={`pyramid-glass__band pyramid-glass__band--${layer.level}`}
      data-step={layer.level}
      aria-labelledby={labelId}
      style={bandStyle(layer.level)}
    >
      <BandSurface level={layer.level} />
      <h2 id={labelId} className="pyramid-glass__level-badge">
        Layer {layer.level}
      </h2>
      <div
        className={`pyramid-glass__band-items pyramid-glass__band-items--${layer.items.length}`}
      >
        {layer.items.map((item) => (
          <article key={item.title} className="pyramid-glass__card">
            <h3 className="pyramid-glass__card-title">{item.title}</h3>
            <p className="pyramid-glass__card-desc">{item.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SideNotes({ side }: { side: "left" | "right" }) {
  const notes = PYRAMID_SIDE_NOTES.filter((note) => note.side === side);

  return (
    <aside
      className={`pyramid-glass__side-notes pyramid-glass__side-notes--${side}`}
      aria-label={`${side === "left" ? "Left" : "Right"} GTM notes`}
    >
      {notes.map((note) => (
        <article key={note.id} className="pyramid-glass__side-note">
          <span className="pyramid-glass__side-note-eyebrow">
            {note.eyebrow}
          </span>
          <h2 className="pyramid-glass__side-note-title">{note.title}</h2>
          <p className="pyramid-glass__side-note-copy">{note.copy}</p>
        </article>
      ))}
    </aside>
  );
}

export function GtmPyramidAsset() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [apexLead, ...apexTail] = PYRAMID_APEX.split(" ");
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

      <div className="pyramid-glass__map" ref={stageRef}>
        <div
          className="pyramid-glass__monolith"
          aria-label="Five-layer GTM pyramid"
          style={MONOLITH_STYLE}
        >
          <div className="pyramid-glass__capstone">
            <svg
              className="pyramid-glass__capstone-surface"
              viewBox="0 0 200 200"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M 100 3 C 106 3 110 7 114 15 L 197 177 C 204 191 196 198 181 198 H 19 C 4 198 -4 191 3 177 L 86 15 C 90 7 94 3 100 3 Z" />
            </svg>
            <span className="pyramid-glass__cap-star" aria-hidden="true">
              ★
            </span>
            <span className="pyramid-glass__cap-label">
              <span>{apexLead}</span>
              <span>{apexTail.join(" ")}</span>
            </span>
          </div>
          {[...PYRAMID_LAYERS].reverse().map((layer) => (
            <Band key={layer.id} layer={layer} />
          ))}
        </div>

        <SideNotes side="left" />
        <SideNotes side="right" />
      </div>

      <div className="pyramid-glass__closer">
        <span className="pyramid-glass__closer-stars" aria-hidden="true">
          ✦✦
        </span>
        {accentSpan(PYRAMID_CTA, PYRAMID_CTA_ACCENT)}
      </div>

      <img
        className="spine-glass__bust-corner"
        src={withBasePath(ABOUT_CONTENT.founder.footerPhoto)}
        alt=""
        aria-hidden="true"
      />
    </div>
  );
}
