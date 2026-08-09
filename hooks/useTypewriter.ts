"use client";

import { useEffect, useRef, useState } from "react";

function typingDelay(char: string) {
  let delay = 32 + Math.random() * 40;
  if (Math.random() < 0.06) delay += 140 + Math.random() * 200;
  if (char === " ") delay += 16 + Math.random() * 28;
  if (char === "," || char === "—" || char === "-") delay += 85 + Math.random() * 120;
  if (char === ".") delay += 210 + Math.random() * 280;
  return delay;
}

type UseTypewriterOptions = {
  text: string;
  /** When false, typing pauses but keeps progress. */
  active: boolean;
  /** Skip animation and show the full string immediately. */
  instant?: boolean;
};

/**
 * Reveals `text` one character at a time with human-ish timing variance.
 * Resets when `text` changes. Pauses when `active` is false and resumes
 * from the same position.
 */
export function useTypewriter({ text, active, instant = false }: UseTypewriterOptions) {
  const [visibleCount, setVisibleCount] = useState(instant ? text.length : 0);
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = instant ? text.length : 0;
    setVisibleCount(instant ? text.length : 0);
    setIsTyping(false);
  }, [text, instant]);

  useEffect(() => {
    if (instant) return;

    if (!active) {
      setIsTyping(false);
      return;
    }

    if (indexRef.current >= text.length) {
      setVisibleCount(text.length);
      setIsTyping(false);
      return;
    }

    setVisibleCount(indexRef.current);
    setIsTyping(true);

    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const typeNext = () => {
      if (cancelled) return;

      const next = indexRef.current + 1;
      if (next > text.length) {
        setIsTyping(false);
        return;
      }

      indexRef.current = next;
      setVisibleCount(next);

      if (next < text.length) {
        timer = setTimeout(typeNext, typingDelay(text[next - 1] ?? ""));
      } else {
        setIsTyping(false);
      }
    };

    const leadIn = indexRef.current === 0 ? 220 + Math.random() * 320 : typingDelay(text[indexRef.current] ?? "");
    timer = setTimeout(typeNext, leadIn);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [text, active, instant]);

  return {
    display: text.slice(0, visibleCount),
    isTyping,
    isComplete: visibleCount >= text.length && text.length > 0,
  };
}
