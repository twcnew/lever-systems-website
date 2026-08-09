"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { annotate } from "rough-notation";
import type { RoughAnnotationConfig } from "rough-notation/lib/model";
import { TegakiRenderer, computeTimeline } from "tegaki";
import caveat from "tegaki/fonts/caveat";
import { prefersReducedMotion } from "@/lib/prefersReducedMotion";
import {
  INK_CTA_READING_GAP_MS,
  INK_PATH_DRAW_MS,
  useMidReveal,
} from "./useMidReveal";
import {
  TEGAKI_INK_EFFECTS,
  TEGAKI_NOTE_STYLE,
  TEGAKI_QUALITY,
  TEGAKI_TIMING,
  TEGAKI_WRITE_DURATION_S,
} from "./tegakiInk";

export type InkAnnotateVariant = "underline" | "circle" | "bracket";
export type InkAnnotateReveal = "always" | "hover" | "inView";

type InkAnnotateProps = {
  variant: InkAnnotateVariant;
  note?: string;
  noteDuration?: number;
  children: ReactNode;
  className?: string;
  notePlacement?: "margin" | "below";
  multiline?: boolean;
  reveal?: InkAnnotateReveal;
};

const ROYAL_INK = "var(--royal)";

function buildAnnotationConfig(
  variant: InkAnnotateVariant,
  multiline: boolean,
  animate: boolean,
): RoughAnnotationConfig {
  const base: RoughAnnotationConfig = {
    type: variant,
    color: ROYAL_INK,
    strokeWidth: variant === "circle" ? 1.8 : 1.6,
    padding:
      variant === "circle" ? 4 : variant === "bracket" ? [4, 2] : 3,
    animationDuration: INK_PATH_DRAW_MS,
    animate,
    multiline: variant === "underline" && multiline,
  };

  if (variant === "circle") {
    return { ...base, iterations: 2 };
  }

  if (variant === "bracket") {
    return { ...base, brackets: "right" };
  }

  return base;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function waitForDraw(durationMs: number) {
  return wait(durationMs + 80);
}

export function InkAnnotate({
  variant,
  note,
  noteDuration = TEGAKI_WRITE_DURATION_S,
  children,
  className = "",
  notePlacement = "margin",
  multiline = false,
  reveal = "inView",
}: InkAnnotateProps) {
  const useMultilineUnderline = variant === "underline" && multiline;
  const revealInView = reveal === "inView";
  const revealOnHover = reveal === "hover";
  const revealAlways = reveal === "always";

  const rootRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const annotationRef = useRef<ReturnType<typeof annotate> | null>(null);
  const settledRef = useRef(false);
  const noteResolveRef = useRef<(() => void) | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawComplete, setDrawComplete] = useState(false);
  const [noteVisible, setNoteVisible] = useState(false);
  const [notePlaying, setNotePlaying] = useState(false);
  const [noteInstantComplete, setNoteInstantComplete] = useState(false);
  const [notePhase, setNotePhase] = useState<"pending" | "writing" | "complete">(
    "pending",
  );
  const [hoverDrawn, setHoverDrawn] = useState(false);

  const noteTotalDuration = useMemo(
    () => (note ? computeTimeline(note, caveat).totalDuration : 0),
    [note],
  );

  const destroyAnnotation = useCallback(() => {
    annotationRef.current?.remove();
    annotationRef.current = null;
  }, []);

  const createAnnotation = useCallback(
    (animate: boolean) => {
      const el = textRef.current;
      if (!el) return null;

      destroyAnnotation();
      const annotation = annotate(
        el,
        buildAnnotationConfig(variant, multiline, animate),
      );
      annotationRef.current = annotation;
      return annotation;
    },
    [destroyAnnotation, multiline, variant],
  );

  const resolveNoteWrite = useCallback(() => {
    noteResolveRef.current?.();
    noteResolveRef.current = null;
  }, []);

  const handleNoteComplete = useCallback(() => {
    setNotePhase("complete");
    setNoteVisible(true);
    resolveNoteWrite();
  }, [resolveNoteWrite]);

  const playNote = useCallback(() => {
    return new Promise<void>((resolve) => {
      noteResolveRef.current = resolve;
      setNotePlaying(true);
      setNotePhase("writing");
    });
  }, []);

  const skipToEnd = useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;

    const annotation = createAnnotation(false);
    annotation?.show();
    setIsDrawing(false);
    setDrawComplete(true);

    if (note) {
      setNoteInstantComplete(true);
      setNotePlaying(true);
      setNotePhase("complete");
      setNoteVisible(true);
    }
  }, [createAnnotation, note]);

  const playDraw = useCallback(async () => {
    if (settledRef.current) return;
    settledRef.current = true;

    const annotation = createAnnotation(true);
    if (!annotation) {
      setDrawComplete(true);
      if (note) {
        setNoteInstantComplete(true);
        setNoteVisible(true);
        setNotePhase("complete");
      }
      return;
    }

    setIsDrawing(true);
    annotation.show();
    await waitForDraw(INK_PATH_DRAW_MS);
    setIsDrawing(false);
    setDrawComplete(true);

    if (note) {
      await wait(INK_CTA_READING_GAP_MS);
      await playNote();
    }
  }, [createAnnotation, note, playNote]);

  const playDrawRef = useRef(playDraw);
  const skipToEndRef = useRef(skipToEnd);
  playDrawRef.current = playDraw;
  skipToEndRef.current = skipToEnd;

  useEffect(() => destroyAnnotation, [destroyAnnotation]);

  useMidReveal(rootRef, {
    enabled: revealInView,
    onReveal: () => void playDrawRef.current(),
    onSkip: () => skipToEndRef.current(),
  });

  useEffect(() => {
    if (!revealAlways) return;

    if (prefersReducedMotion()) {
      skipToEndRef.current();
      return;
    }

    void playDrawRef.current();
  }, [revealAlways]);

  const handleHoverReveal = () => {
    if (!revealOnHover || hoverDrawn) return;
    setHoverDrawn(true);

    if (prefersReducedMotion()) {
      const annotation = createAnnotation(false);
      annotation?.show();
      return;
    }

    const annotation = createAnnotation(true);
    annotation?.show();
  };

  const hoverDrawActive = revealOnHover && hoverDrawn;

  const noteTegakiTime = noteInstantComplete
    ? noteTotalDuration
    : notePlaying
      ? { mode: "uncontrolled" as const, duration: noteDuration }
      : 0;

  return (
    <span
      ref={rootRef}
      className={`ink-annotate ink-annotate--${variant} ink-annotate--note-${notePlacement}${
        useMultilineUnderline ? " ink-annotate--multiline" : ""
      }${note ? " ink-annotate--has-note" : ""}${
        revealInView ? " ink-annotate--reveal-in-view" : ""
      }${revealOnHover ? " ink-annotate--reveal-hover" : ""}${
        isDrawing ? " ink-annotate--is-drawing" : ""
      }${drawComplete ? " ink-annotate--draw-complete" : ""}${
        noteVisible ? " ink-annotate--note-visible" : ""
      }${hoverDrawActive ? " ink-annotate--is-drawn" : ""} ${className}`.trim()}
      tabIndex={revealOnHover ? 0 : undefined}
      onMouseEnter={revealOnHover ? handleHoverReveal : undefined}
      onFocus={revealOnHover ? handleHoverReveal : undefined}
    >
      <span ref={textRef} className="ink-annotate__text">
        {children}
      </span>
      {note ? (
        <div
          className={`ink-annotate__note${
            notePhase === "pending" ? " ink-annotate__note--pending" : ""
          }${notePhase === "writing" ? " ink-annotate__note--writing" : ""}${
            notePhase === "complete" ? " ink-annotate__note--complete" : ""
          }`}
          aria-hidden="true"
        >
          <TegakiRenderer
            font={caveat}
            time={noteTegakiTime}
            timing={TEGAKI_TIMING}
            quality={TEGAKI_QUALITY}
            onComplete={handleNoteComplete}
            style={TEGAKI_NOTE_STYLE}
            effects={TEGAKI_INK_EFFECTS}
          >
            {note}
          </TegakiRenderer>
        </div>
      ) : null}
    </span>
  );
}
