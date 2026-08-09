"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const CalEmbed = dynamic(
  () =>
    import("../lp/ClosingCalEmbed").then((mod) => mod.ClosingCalEmbed),
  {
    ssr: false,
    loading: () => (
      <div className="lp-closing-cal lp-closing-cal--loading" aria-hidden="true" />
    ),
  },
);

/** Mount Cal only once the closing section approaches the viewport. */
export function LazyClosingCalEmbed() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || ready) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ready]);

  return (
    <div ref={rootRef}>
      {ready ? (
        <CalEmbed />
      ) : (
        <div className="lp-closing-cal lp-closing-cal--loading" aria-hidden="true" />
      )}
    </div>
  );
}
