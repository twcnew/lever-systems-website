"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildProofShowcaseItems } from "@/lib/proofShowcase";
import { ProofCard } from "./ProofCard";

type ProofShowcaseProps = {
  excludeSlug?: string;
  layout?: "carousel" | "grid";
  /** Quote on homepage; overview of what’s inside on /use-cases index. */
  body?: "quote" | "overview";
};

export function ProofShowcase({
  excludeSlug,
  layout = "carousel",
  body = "quote",
}: ProofShowcaseProps) {
  const isGrid = layout === "grid";
  const items = useMemo(() => {
    const all = buildProofShowcaseItems();
    return excludeSlug
      ? all.filter((item) => item.slug !== excludeSlug)
      : all;
  }, [excludeSlug]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateNav = useCallback(() => {
    if (isGrid) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    setCanPrev(viewport.scrollLeft > 4);
    setCanNext(viewport.scrollLeft < maxScroll - 4);
  }, [isGrid]);

  useEffect(() => {
    if (isGrid) return;
    updateNav();
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", updateNav);
    return () => {
      viewport.removeEventListener("scroll", updateNav);
      window.removeEventListener("resize", updateNav);
    };
  }, [updateNav, items.length, isGrid]);

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const cell = viewport.querySelector<HTMLElement>(".proof-board__cell");
    const step = cell ? cell.offsetWidth + 16 : viewport.clientWidth * 0.8;
    viewport.scrollBy({ left: direction * step, behavior: "smooth" });
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <figure
      className={isGrid ? "proof-board proof-board--grid" : "proof-board"}
      aria-label="Client case studies"
    >
      <div className="proof-board__viewport" ref={viewportRef}>
        <div className="proof-board__track">
          {items.map((item) => (
            <ProofCard item={item} body={body} key={item.slug} />
          ))}
        </div>
      </div>
      {!isGrid && (
        <>
          <button
            type="button"
            className="proof-board__nav proof-board__nav--prev"
            onClick={() => scrollByCard(-1)}
            disabled={!canPrev}
            aria-label="Previous case studies"
          >
            ←
          </button>
          <button
            type="button"
            className="proof-board__nav proof-board__nav--next"
            onClick={() => scrollByCard(1)}
            disabled={!canNext}
            aria-label="Next case studies"
          >
            →
          </button>
        </>
      )}
    </figure>
  );
}
