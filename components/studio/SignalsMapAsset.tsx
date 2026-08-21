"use client";

import { useRef } from "react";
import { Brand } from "@/components/icons";
import { ABOUT_CONTENT } from "@/lib/aboutContent";
import { withBasePath } from "@/lib/basePath";
import { useSignalsFlow } from "@/hooks/useSignalsFlow";
import {
  SIGNALS_HUB,
  SIGNALS_KICKER,
  SIGNALS_KICKER_ACCENT,
  SIGNALS_RINGS,
  SIGNALS_RULE,
  SIGNALS_TITLE,
  SIGNALS_TITLE_ACCENT,
  type SignalGroup,
  type SignalRing,
} from "@/lib/studio/signalsMap";

// Ring circle (decorative) + label sit at the ring radius — chips are
// centered ON this circle (single radius per ring, no band).
const RING_RADIUS_PCT: Record<SignalRing["id"], number> = {
  first: 18,
  second: 30,
  third: 42,
};

function ringRadius(ringId: SignalRing["id"]) {
  return RING_RADIUS_PCT[ringId];
}

// Stagger base for the twinkle, synced to the ripple wave reaching each ring.
const TWINKLE_BASE: Record<SignalRing["id"], number> = {
  first: 0.4,
  second: 0.9,
  third: 1.4,
};

function polarPct(angleDeg: number, radiusPct: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: 50 + Math.cos(rad) * radiusPct,
    y: 50 + Math.sin(rad) * radiusPct,
  };
}

function accentSpan(text: string, accent?: string) {
  if (!accent || !text.includes(accent)) return text;
  const index = text.indexOf(accent);
  return (
    <>
      {text.slice(0, index)}
      <span className="signals-glass__accent">{accent}</span>
      {text.slice(index + accent.length)}
    </>
  );
}

function RingLabel({ ring }: { ring: SignalRing }) {
  const radius = RING_RADIUS_PCT[ring.id];
  const { x, y } = polarPct(0, radius);
  return (
    <span
      className={`signals-glass__ring-label signals-glass__ring-label--${ring.id}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span className="signals-glass__ring-name">{ring.label}</span>
      <span className="signals-glass__ring-sub">{ring.sublabel}</span>
    </span>
  );
}

function RingGroup({
  group,
  ringId,
  radiusPct,
  angle,
  index,
}: {
  group: SignalGroup;
  ringId: SignalRing["id"];
  radiusPct: number;
  angle: number;
  index: number;
}) {
  const { x, y } = polarPct(angle, radiusPct);
  const delay = TWINKLE_BASE[ringId] + index * 0.18;
  return (
    <span
      className={`signals-glass__group signals-glass__group--${ringId}`}
      style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}s` }}
    >
      <span className="signals-glass__group-label">{group.label}</span>
      <span className="signals-glass__group-logos">
        {group.tools.map((tool) => (
          <img
            key={tool.id}
            className="signals-glass__group-logo"
            src={withBasePath(tool.src)}
            alt={tool.label}
            width={18}
            height={18}
          />
        ))}
      </span>
    </span>
  );
}

function Ring({ ring }: { ring: SignalRing }) {
  const radius = RING_RADIUS_PCT[ring.id];
  const count = ring.groups.length;
  // Center the gap at the top (angle 0) so the ring label sits in the clear
  // arc. Interleave rings with distinct offsets so groups never line up as
  // spokes across rings (which causes radial chip overlaps).
  const gap = 72;
  const arc = 360 - gap;
  const step = count > 1 ? arc / count : 0;
  // All gaps centered at top (angle 0) so every ring is mirror-symmetric
  // across the vertical axis. Cross-ring radial stacks only happen at
  // the gap edges (±gap/2), where inner radii differ enough across rings
  // (first 10% / second 25% / third 37%) to clear chip height.
  const rotations: Record<SignalRing["id"], number> = {
    first: 0,
    second: 0,
    third: 0,
  };
  const start = gap / 2 + rotations[ring.id];

  return (
    <>
      <div
        className={`signals-glass__ring signals-glass__ring--${ring.id}`}
        style={{ width: `${radius * 2}%`, height: `${radius * 2}%` }}
      />
      <RingLabel ring={ring} />
      {ring.groups.map((group, i) => (
        <RingGroup
          key={group.id}
          group={group}
          ringId={ring.id}
          radiusPct={ringRadius(ring.id)}
          angle={start + i * step}
          index={i}
        />
      ))}
    </>
  );
}

export function SignalsMapAsset() {
  const rootRef = useRef<HTMLDivElement>(null);
  useSignalsFlow(rootRef);

  return (
    <div className="signals-glass" ref={rootRef}>
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

      <header className="signals-glass__hero">
        <h1 className="signals-glass__title">
          {accentSpan(SIGNALS_TITLE, SIGNALS_TITLE_ACCENT)}
        </h1>
        <p className="signals-glass__kicker">
          {accentSpan(SIGNALS_KICKER, SIGNALS_KICKER_ACCENT)}
        </p>
      </header>

      <div className="signals-glass__rings">
        <div className="signals-glass__rings-square">
          <span className="signals-glass__pulse" aria-hidden="true" />
          <span
            className="signals-glass__pulse signals-glass__pulse--2"
            aria-hidden="true"
          />
          <span
            className="signals-glass__pulse signals-glass__pulse--3"
            aria-hidden="true"
          />
          {/* Clay hub at the very center */}
          <span className="signals-glass__hub-wrap">
            <span className="signals-glass__hub" aria-hidden="true">
              <img
                className="signals-glass__hub-logo"
                src={withBasePath(SIGNALS_HUB.src)}
                alt={SIGNALS_HUB.label}
                width={28}
                height={28}
              />
            </span>
            <span className="signals-glass__hub-caption">{SIGNALS_HUB.label}</span>
          </span>
          {SIGNALS_RINGS.map((ring) => (
            <Ring key={ring.id} ring={ring} />
          ))}
        </div>
      </div>

      <div className="signals-glass__rule">
        <span className="signals-glass__rule-text">{SIGNALS_RULE}</span>
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
