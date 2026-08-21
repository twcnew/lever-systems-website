"use client";

import { useRef } from "react";
import { Brand } from "@/components/icons";
import { FounderNameInk } from "@/components/system/FounderNameInk";
import { InkAnnotate } from "@/components/system/InkAnnotate";
import { useSpineFlow } from "@/hooks/useSpineFlow";
import { useSpineInkStrokes } from "@/hooks/useSpineInkStrokes";
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
    <span className="spine-flow__chip">
      {tool.src ? (
        <img
          className="spine-flow__chip-logo"
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
    card.dead ? " spine-split--dead" : "",
    card.feedback ? " spine-split--feedback" : "",
    card.tools.length ? "" : " spine-split--plain",
  ].join("");

  return (
    <div
      className={`spine-split${extra}`}
      data-spine-node={nodeId}
      data-spine-step={step}
      data-spine-ink="box"
      {...(card.feedback ? { "data-spine-loop": "" } : {})}
    >
      <p className="spine-split__action">{card.action}</p>
      {card.tools.length > 0 && (
        <div className="spine-split__deck">
          {card.tools.map((tool) =>
            tool.src ? (
              <img
                key={tool.id}
                className="spine-split__logo"
                src={withBasePath(tool.src)}
                alt={tool.label}
                width={22}
                height={22}
              />
            ) : (
              <span key={tool.id} className="spine-split__word">
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
      className={`spine-node${variant !== "default" ? ` spine-node--${variant}` : ""}`}
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
      className={`spine-tier spine-tier--${rank}`}
      data-spine-node={nodeId}
      data-spine-step={step}
      data-spine-ink="box"
    >
      <p className="spine-tier__label">{tier.label}</p>
      <p className="spine-tier__note">{tier.note}</p>
    </div>
  );
}

function ZoneHead({ zone }: { zone: SpineZone }) {
  return (
    <header className="spine-zone__head">
      <span className="spine-zone__pill">{zone.label}</span>
      {zone.tools.length > 0 && (
        <span className="spine-zone__chips">
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
      className={`spine-wire-slot spine-wire-slot--${variant}`}
      aria-hidden="true"
    />
  );
}

function zoneClassName(zone: SpineZone) {
  return zone.emphasis === "royal" ? "spine-zone spine-zone--royal" : "spine-zone";
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
      <div className="spine-zone__body">
        <div className="spine-zone__trio">
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
      <div className="spine-zone__body">
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
        <div className="spine-zone__trio">
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
      <div className="spine-zone__fork">
        <div className="spine-hitl__owner-row">
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
        <div className="spine-zone__verbs">
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
      <div className="spine-zone__body">
        {after && (
          <OutlineNode label={after.label} nodeId="route-after" step={0} />
        )}
        <WireSlot variant="fan" />
        <div className="spine-zone__trio spine-zone__trio--cards">
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

function annotateAccent(text: string, accent?: string) {
  if (!accent || !text.includes(accent)) return text;

  const index = text.indexOf(accent);
  return (
    <>
      {text.slice(0, index)}
      <InkAnnotate variant="underline" reveal="always">
        {accent}
      </InkAnnotate>
      {text.slice(index + accent.length)}
    </>
  );
}

export function SpineAsset() {
  const { title, titleAccent, kicker, kickerAccent, zones } = SPINE_FLOWCHART;
  const [capture, score, hitl, route] = zones;
  const rootRef = useRef<HTMLDivElement>(null);

  useSpineInkStrokes(rootRef);
  useSpineFlow(rootRef);

  return (
    <div className="spine-flow" ref={rootRef}>
      <header className="spine-flow__hero">
        <h1 className="spine-flow__title">
          {annotateAccent(title, titleAccent)}
        </h1>
        <p className="spine-flow__kicker">
          {annotateAccent(kicker, kickerAccent)}
        </p>
      </header>

      <div className="spine-flow__machine">
        <Zone zone={capture} />
        <WireSlot variant="join" />
        <div className="spine-flow__loop-span">
          <Zone zone={score} />
          <WireSlot variant="join" />
          <Zone zone={hitl} />
        </div>
        <WireSlot variant="join" />
        <Zone zone={route} />
      </div>

      <footer className="spine-flow__footer">
        <div className="spine-flow__footer-cell spine-flow__footer-cell--name">
          <FounderNameInk
            name={ABOUT_CONTENT.founder.name}
            className="site-footer__author-name-ink"
            size="footer"
            instant
          />
          <span className="spine-flow__footer-role">
            {ABOUT_CONTENT.founder.role}
          </span>
        </div>
        <div className="spine-flow__footer-cell spine-flow__footer-cell--brand">
          <Brand className="spine-flow__wordmark" />
        </div>
        <div className="spine-flow__footer-cell spine-flow__footer-cell--portrait">
          <img
            className="spine-flow__footer-portrait"
            src={withBasePath(
              ABOUT_CONTENT.founder.footerPhoto ?? ABOUT_CONTENT.founder.photo,
            )}
            alt={ABOUT_CONTENT.founder.name}
            width={900}
            height={824}
          />
        </div>
      </footer>
    </div>
  );
}
