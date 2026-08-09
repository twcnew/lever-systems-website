"use client";

import { useEffect, useRef, useState } from "react";

type AsciiDiagramProps = {
  art: string;
  /** Changing this value replays the drawing animation. */
  animateKey?: string | number;
  className?: string;
  /** Accessible description; the glyphs themselves are decorative. */
  label?: string;
  /** Drawing speed in characters per second. */
  charsPerSecond?: number;
};

export function AsciiDiagram({
  art,
  animateKey,
  className = "",
  label,
  charsPerSecond = 900,
}: AsciiDiagramProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStarted(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(art.length);
      return;
    }

    setCount(0);
    // Time-based progress so throttled frames still catch up.
    const startedAt = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const current = Math.min(
        Math.round(((now - startedAt) / 1000) * charsPerSecond),
        art.length,
      );
      setCount(current);
      if (current < art.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, art, animateKey, charsPerSecond]);

  const drawing = count < art.length;
  const shown = art.slice(0, count);
  const rest = drawing ? art.slice(count + 1) : "";

  return (
    <div className={`ascii ${className}`.trim()} ref={rootRef} role="img" aria-label={label}>
      {/* invisible sizing layer keeps dimensions stable during the draw */}
      <pre className="ascii__size" aria-hidden="true">
        {art}
      </pre>
      <pre className="ascii__draw" aria-hidden="true">
        {shown}
        {drawing && <span className="ascii__cursor">█</span>}
        {drawing && <span className="ascii__hidden">{rest}</span>}
      </pre>
    </div>
  );
}
