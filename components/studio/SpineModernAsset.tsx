"use client";

import { useRef } from "react";
import { Brand } from "@/components/icons";
import { useSpineGlassFlow } from "@/hooks/useSpineGlassFlow";
import { ABOUT_CONTENT } from "@/lib/aboutContent";
import { withBasePath } from "@/lib/basePath";
import {
  SPINE_FLOWCHART,
  type SpineCard,
  type SpineTier,
  type SpineTool,
  type SpineZone,
} from "@/lib/studio/spineFlowchart";

function Chip({ tool }: { tool: SpineTool }) {
  return (
    <span className="spine-glass__chip">
      {tool.src ? (
        <img
          className="spine-glass__chip-logo"
          src={withBasePath(tool.src)}
          alt=""
          width={16}
          height={16}
        />
      ) : null}
      <span>{tool.label}</span>
    </span>
  );
}

function SplitCard({
  card,
  nodeId,
  step,
}: {
  card: SpineCard;
  nodeId: string;
  step: number;
}) {
  const extra = [
    card.dead ? " spine-glass__split--dead" : "",
    card.feedback ? " spine-glass__split--feedback" : "",
    card.tools.length ? "" : " spine-glass__split--plain",
  ].join("");

  return (
    <div
      className={`spine-glass__split${extra}`}
      data-spine-node={nodeId}
      data-spine-step={step}
      data-spine-ink="box"
      {...(card.feedback ? { "data-spine-loop": "" } : {})}
    >
      <p className="spine-glass__split-action">{card.action}</p>
      {card.tools.length > 0 && (
        <div className="spine-glass__split-deck">
          {card.tools.map((tool) =>
            tool.src ? (
              <img
                key={tool.id}
                className="spine-glass__split-logo"
                src={withBasePath(tool.src)}
                alt={tool.label}
                width={22}
                height={22}
              />
            ) : (
              <span key={tool.id} className="spine-glass__split-word">
                {tool.label}
              </span>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function OutlineNode({
  label,
  nodeId,
  variant = "default",
  step,
}: {
  label: string;
  nodeId: string;
  variant?: "default" | "alt" | "rule";
  step: number;
}) {
  return (
    <p
      className={`spine-glass__node${variant !== "default" ? ` spine-glass__node--${variant}` : ""}`}
      data-spine-node={nodeId}
      data-spine-step={step}
      data-spine-ink="box"
    >
      {label}
    </p>
  );
}

function TierNode({
  tier,
  nodeId,
  rank,
  step,
}: {
  tier: SpineTier;
  nodeId: string;
  rank: 1 | 2 | 3;
  step: number;
}) {
  return (
    <div
      className={`spine-glass__tier spine-glass__tier--${rank}`}
      data-spine-node={nodeId}
      data-spine-step={step}
      data-spine-ink="box"
    >
      <p className="spine-glass__tier-label">{tier.label}</p>
      <p className="spine-glass__tier-note">{tier.note}</p>
    </div>
  );
}

function ZoneHead({ zone }: { zone: SpineZone }) {
  return (
    <header className="spine-glass__head">
      <span className="spine-glass__pill">{zone.label}</span>
      {zone.tools.length > 0 && (
        <span className="spine-glass__chips">
          {zone.tools.map((tool) => (
            <Chip key={tool.id} tool={tool} />
          ))}
        </span>
      )}
    </header>
  );
}

function WireSlot({
  variant,
}: {
  variant: "fan" | "mini" | "lateral" | "exit" | "join";
}) {
  return (
    <div
      className={`spine-glass__slot spine-glass__slot--${variant}`}
      aria-hidden="true"
    />
  );
}

function zoneClassName(zone: SpineZone) {
  return zone.emphasis === "royal"
    ? "spine-glass__zone spine-glass__zone--royal"
    : "spine-glass__zone";
}

function CaptureZone({ zone }: { zone: SpineZone }) {
  const [clay] = zone.cards;
  const [roi] = zone.nodes;

  return (
    <section
      className={zoneClassName(zone)}
      data-zone={zone.id}
      data-spine-zone={zone.id}
      data-spine-node={`zone-${zone.id}`}
      data-spine-ink="box"
    >
      <ZoneHead zone={zone} />
      <div className="spine-glass__body">
        <div className="spine-glass__trio">
          {zone.inputs?.map((input, index) => (
            <OutlineNode
              key={input.id}
              label={input.label}
              nodeId={`capture-${input.id}`}
              step={index}
            />
          ))}
        </div>
        <WireSlot variant="fan" />
        {clay && <SplitCard card={clay} nodeId="capture-core" step={3} />}
        <WireSlot variant="mini" />
        {roi && (
          <OutlineNode
            label={roi.label}
            nodeId="capture-rule"
            variant="rule"
            step={4}
          />
        )}
      </div>
    </section>
  );
}

function ScoreZone({ zone }: { zone: SpineZone }) {
  const [criteria] = zone.nodes;
  const [tierCard] = zone.cards;

  return (
    <section
      className={zoneClassName(zone)}
      data-zone={zone.id}
      data-spine-zone={zone.id}
      data-spine-node={`zone-${zone.id}`}
      data-spine-ink="box"
    >
      <ZoneHead zone={zone} />
      <div className="spine-glass__body">
        {criteria && (
          <OutlineNode
            label={criteria.label}
            nodeId="score-criteria"
            step={0}
          />
        )}
        <WireSlot variant="mini" />
        {tierCard && (
          <SplitCard card={tierCard} nodeId="score-core" step={1} />
        )}
        <WireSlot variant="fan" />
        <div className="spine-glass__trio">
          {zone.tiers?.map((tier, index) => (
            <TierNode
              key={tier.id}
              tier={tier}
              nodeId={`score-tier-${index + 1}`}
              rank={(index + 1) as 1 | 2 | 3}
              step={2 + index}
            />
          ))}
        </div>
        <WireSlot variant="exit" />
      </div>
    </section>
  );
}

function HitlZone({ zone }: { zone: SpineZone }) {
  const [owner] = zone.nodes;

  return (
    <section
      className={zoneClassName(zone)}
      data-zone={zone.id}
      data-spine-zone={zone.id}
      data-spine-node={`zone-${zone.id}`}
      data-spine-ink="box"
    >
      <ZoneHead zone={zone} />
      <div className="spine-glass__fork">
        <div className="spine-glass__owner-row">
          {owner && (
            <OutlineNode
              label={owner.label}
              nodeId="hitl-owner"
              step={0}
            />
          )}
          {zone.fallback && (
            <>
              <WireSlot variant="lateral" />
              <OutlineNode
                label={zone.fallback.label}
                nodeId="hitl-round-robin"
                variant="alt"
                step={1}
              />
            </>
          )}
        </div>
        <WireSlot variant="fan" />
        <div className="spine-glass__verbs">
          {zone.cards.map((card, index) => (
            <SplitCard
              key={card.id}
              card={card}
              nodeId={`hitl-${card.id}`}
              step={2 + index}
            />
          ))}
        </div>
        <WireSlot variant="exit" />
      </div>
    </section>
  );
}

function RouteZone({ zone }: { zone: SpineZone }) {
  const [after] = zone.nodes;

  return (
    <section
      className={zoneClassName(zone)}
      data-zone={zone.id}
      data-spine-zone={zone.id}
      data-spine-node={`zone-${zone.id}`}
      data-spine-ink="box"
    >
      <ZoneHead zone={zone} />
      <div className="spine-glass__body">
        {after && (
          <OutlineNode label={after.label} nodeId="route-after" step={0} />
        )}
        <WireSlot variant="fan" />
        <div className="spine-glass__trio spine-glass__trio--cards">
          {zone.cards.map((card, index) => (
            <SplitCard
              key={card.id}
              card={card}
              nodeId={`route-${card.id}`}
              step={1 + index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Zone({ zone }: { zone: SpineZone }) {
  if (zone.topology === "fan-in") return <CaptureZone zone={zone} />;
  if (zone.topology === "tiers") return <ScoreZone zone={zone} />;
  if (zone.topology === "hitl") return <HitlZone zone={zone} />;
  return <RouteZone zone={zone} />;
}

function accentSpan(text: string, accent?: string) {
  if (!accent || !text.includes(accent)) return text;

  const index = text.indexOf(accent);
  return (
    <>
      {text.slice(0, index)}
      <span className="spine-glass__accent">{accent}</span>
      {text.slice(index + accent.length)}
    </>
  );
}

export function SpineModernAsset() {
  const { title, titleAccent, kicker, kickerAccent, zones } = SPINE_FLOWCHART;
  const [capture, score, hitl, route] = zones;
  const rootRef = useRef<HTMLDivElement>(null);

  useSpineGlassFlow(rootRef);

  return (
    <div className="spine-glass" ref={rootRef}>
      <div className="spine-glass__aurora" aria-hidden="true" />
      <div className="spine-glass__grain" aria-hidden="true" />

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
          <span className="spine-glass__dot" aria-hidden="true">·</span>
          <span className="spine-glass__role">{ABOUT_CONTENT.founder.role}</span>
          <Brand className="spine-glass__wordmark" />
        </div>
      </header>

      <header className="spine-glass__hero">
        <h1 className="spine-glass__title">
          {accentSpan(title, titleAccent)}
        </h1>
        <p className="spine-glass__kicker">
          {accentSpan(kicker, kickerAccent)}
        </p>
      </header>

      <div className="spine-glass__machine">
        <Zone zone={capture} />
        <WireSlot variant="join" />
        <div className="spine-glass__loop-span">
          <Zone zone={score} />
          <WireSlot variant="join" />
          <Zone zone={hitl} />
        </div>
        <WireSlot variant="join" />
        <Zone zone={route} />
      </div>

      <span className="spine-glass__url" aria-hidden="true">lever.systems</span>

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
