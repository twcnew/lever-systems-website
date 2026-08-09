"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { TegakiRenderer, computeTimeline } from "tegaki";
import caveat from "tegaki/fonts/caveat";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";
import { useMidReveal } from "./useMidReveal";
import {
  TEGAKI_INK_EFFECTS,
  TEGAKI_QUALITY,
  TEGAKI_SIGNATURE_FOOTER_STYLE,
  TEGAKI_SIGNATURE_STYLE,
  TEGAKI_TIMING,
  TEGAKI_WRITE_DURATION_S,
} from "./tegakiInk";

type FounderNameInkProps = {
  name: string;
  className?: string;
  timing?: "mid" | "early";
  size?: "default" | "footer";
};

export function FounderNameInk({
  name,
  className = "",
  timing = "mid",
  size = "default",
}: FounderNameInkProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const settledRef = useRef(false);
  const completeRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [instantComplete, setInstantComplete] = useState(false);
  const [phase, setPhase] = useState<"pending" | "writing" | "complete">("pending");

  const totalDuration = useMemo(
    () => computeTimeline(name, caveat).totalDuration,
    [name],
  );

  const handleComplete = useCallback(() => {
    if (completeRef.current) return;
    completeRef.current = true;
    setPhase("complete");
  }, []);

  const skipToEnd = useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;

    setPlaying(true);
    setInstantComplete(true);
    setPhase("complete");
    completeRef.current = true;
  }, []);

  const startWriting = useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;

    if (prefersReducedMotion()) {
      skipToEnd();
      return;
    }

    setPhase("writing");
    setPlaying(true);
  }, [skipToEnd]);

  const startWritingRef = useRef(startWriting);
  const skipToEndRef = useRef(skipToEnd);
  startWritingRef.current = startWriting;
  skipToEndRef.current = skipToEnd;

  useMidReveal(rootRef, {
    timing,
    onReveal: () => startWritingRef.current(),
    onSkip: () => skipToEndRef.current(),
  });

  const tegakiTime = instantComplete
    ? totalDuration
    : playing
      ? { mode: "uncontrolled" as const, duration: TEGAKI_WRITE_DURATION_S }
      : 0;

  const signatureStyle =
    size === "footer" ? TEGAKI_SIGNATURE_FOOTER_STYLE : TEGAKI_SIGNATURE_STYLE;

  const classNames = [
    "lever-owner__name-ink",
    phase === "pending" ? "lever-owner__name-ink--pending" : "",
    phase === "writing" ? "lever-owner__name-ink--writing" : "",
    phase === "complete" ? "lever-owner__name-ink--complete" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span ref={rootRef} className={classNames} aria-label={name}>
      <span className="lever-owner__name-ink__hand" aria-hidden="true">
        <span className="lever-owner__name-ink__sizer">{name}</span>
        <TegakiRenderer
          font={caveat}
          time={tegakiTime}
          timing={TEGAKI_TIMING}
          quality={TEGAKI_QUALITY}
          onComplete={handleComplete}
          style={signatureStyle}
          effects={TEGAKI_INK_EFFECTS}
        >
          {name}
        </TegakiRenderer>
      </span>
    </span>
  );
}
