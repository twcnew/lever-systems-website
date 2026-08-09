"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { annotate } from "rough-notation";
import type { RoughAnnotationConfig } from "rough-notation/lib/model";
import { TegakiRenderer, computeTimeline } from "tegaki";
import caveat from "tegaki/fonts/caveat";
import { withBasePath } from "@/lib/basePath";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";
import {
  INK_CTA_READING_GAP_MS,
  INK_PATH_DRAW_MS,
  useMidReveal,
} from "./useMidReveal";
import {
  TEGAKI_CTA_STYLE,
  TEGAKI_INK_EFFECTS,
  TEGAKI_QUALITY,
  TEGAKI_TIMING,
  TEGAKI_WRITE_DURATION_S,
} from "./tegakiInk";

const ROYAL_INK = "var(--royal)";

type InkCtaProps = {
  href: string;
  children: string;
  className?: string;
};

function isInternalRoute(href: string) {
  return href.startsWith("/") && !href.startsWith("#");
}

function buildUnderlineConfig(animate: boolean): RoughAnnotationConfig {
  return {
    type: "underline",
    color: ROYAL_INK,
    strokeWidth: 1.6,
    padding: 3,
    animationDuration: INK_PATH_DRAW_MS,
    animate,
    multiline: true,
  };
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function InkCta({ href, children, className = "" }: InkCtaProps) {
  const label = children;
  const rootRef = useRef<HTMLAnchorElement>(null);
  const handRef = useRef<HTMLSpanElement>(null);
  const annotationRef = useRef<ReturnType<typeof annotate> | null>(null);
  const settledRef = useRef(false);
  const completeRef = useRef(false);
  const playResolveRef = useRef<(() => void) | null>(null);

  const [playing, setPlaying] = useState(false);
  const [instantComplete, setInstantComplete] = useState(false);
  const [phase, setPhase] = useState<"pending" | "writing" | "complete">("pending");

  const totalDuration = useMemo(
    () => computeTimeline(label, caveat).totalDuration,
    [label],
  );

  const destroyAnnotation = useCallback(() => {
    annotationRef.current?.remove();
    annotationRef.current = null;
  }, []);

  const resolvePlay = useCallback(() => {
    playResolveRef.current?.();
    playResolveRef.current = null;
  }, []);

  const drawUnderline = useCallback(
    async (animate: boolean) => {
      const el = handRef.current;
      if (!el) return;

      destroyAnnotation();
      const annotation = annotate(el, buildUnderlineConfig(animate));
      annotationRef.current = annotation;
      annotation.show();

      if (animate) {
        await wait(INK_PATH_DRAW_MS + 80);
      }
    },
    [destroyAnnotation],
  );

  const handleWriteComplete = useCallback(async () => {
    if (completeRef.current) return;
    completeRef.current = true;
    setPhase("complete");
    await drawUnderline(!prefersReducedMotion());
    resolvePlay();
  }, [drawUnderline, resolvePlay]);

  const skipToEnd = useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;

    setPlaying(true);
    setInstantComplete(true);
    setPhase("complete");
    void drawUnderline(false).then(resolvePlay);
  }, [drawUnderline, resolvePlay]);

  const startWriting = useCallback(() => {
    setPhase("writing");
    setPlaying(true);
  }, []);

  const play = useCallback(async () => {
    if (settledRef.current) return;
    settledRef.current = true;

    await wait(INK_CTA_READING_GAP_MS);

    return new Promise<void>((resolve) => {
      playResolveRef.current = resolve;
      startWriting();
    });
  }, [startWriting]);

  const playRef = useRef(play);
  const skipToEndRef = useRef(skipToEnd);
  playRef.current = play;
  skipToEndRef.current = skipToEnd;

  useEffect(() => destroyAnnotation, [destroyAnnotation]);

  useMidReveal(rootRef, {
    timing: "early",
    onReveal: () => void playRef.current(),
    onSkip: () => skipToEndRef.current(),
  });

  const tegakiTime = instantComplete
    ? totalDuration
    : playing
      ? { mode: "uncontrolled" as const, duration: TEGAKI_WRITE_DURATION_S }
      : 0;

  const classNames = [
    "ink-cta",
    phase === "pending" ? "ink-cta--pending" : "",
    phase === "writing" || phase === "complete" ? "ink-cta--written" : "",
    phase === "complete" ? "ink-cta--complete" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const resolvedHref = withBasePath(href);
  const content = (
    <span ref={handRef} className="ink-cta__hand" aria-hidden="true">
      <span className="ink-cta__sizer">{label}</span>
      <TegakiRenderer
        font={caveat}
        time={tegakiTime}
        timing={TEGAKI_TIMING}
        quality={TEGAKI_QUALITY}
        onComplete={() => void handleWriteComplete()}
        style={TEGAKI_CTA_STYLE}
        effects={TEGAKI_INK_EFFECTS}
      >
        {label}
      </TegakiRenderer>
    </span>
  );

  if (isInternalRoute(href)) {
    return (
      <Link
        ref={rootRef}
        className={classNames}
        href={resolvedHref}
        aria-label={label}
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      ref={rootRef}
      className={classNames}
      href={resolvedHref}
      aria-label={label}
    >
      {content}
    </a>
  );
}
