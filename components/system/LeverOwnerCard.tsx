"use client";

import { useRef } from "react";
import { ClaudeConfettiMark } from "./ClaudeConfettiMark";
import { FounderNameInk } from "./FounderNameInk";
import { useLeverOwnerFlow } from "@/hooks/useLeverOwnerFlow";
import { FOUNDER_PHOTO_SRC } from "../HeroPillAvatar";
import type { LeverPillar } from "@/lib/solutionContent";

type LeverOwnerCardProps = {
  founder: {
    name: string;
    role: string;
  };
  pillars: LeverPillar[];
  showMascot?: boolean;
  variant?: "default" | "panel";
};

export function LeverOwnerCard({
  founder,
  pillars,
  showMascot = true,
  variant = "default",
}: LeverOwnerCardProps) {
  const flowRef = useRef<HTMLElement>(null);

  useLeverOwnerFlow({ rootRef: flowRef, mode: variant === "panel" ? "panel" : "default" });

  return (
    <figure
      className={`lever-owner${variant === "panel" ? " lever-owner--panel" : ""}`}
      ref={flowRef}
      aria-label="Why one GTM owner"
    >
      <div className="lever-owner__card">
        {showMascot && (
          <div className="lever-owner__mascot" aria-hidden="true">
            <ClaudeConfettiMark className="lever-owner__mascot-svg" />
          </div>
        )}

        <div className="lever-owner__profile">
          <div className="lever-owner__avatar-wrap">
            <span className="lever-owner__ring" aria-hidden="true" />
            <img
              className="lever-owner__avatar"
              src={FOUNDER_PHOTO_SRC}
              alt=""
              width={96}
              height={96}
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="lever-owner__identity">
            {variant === "panel" ? (
              <FounderNameInk name={founder.name} />
            ) : (
              <span className="lever-owner__name">{founder.name}</span>
            )}
            <span className="lever-owner__role">{founder.role}</span>
          </div>
        </div>

        <ul className="lever-owner__pillars">
          {pillars.map((pillar) => (
            <li className="lever-owner__pillar" key={pillar.label}>
              <span className="lever-owner__pillar-label">{pillar.label}</span>
              <span className="lever-owner__pillar-detail">{pillar.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
