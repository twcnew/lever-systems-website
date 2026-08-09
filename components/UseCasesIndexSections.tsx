"use client";

import Link from "next/link";
import { useState } from "react";
import { CASE_STUDIES } from "@/lib/caseStudies";

export function CustomersWallOfLove() {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = CASE_STUDIES.filter((study) => !study.wallSnippet.startsWith("[TODO"));
  const activeStudy = slides[activeIndex] ?? slides[0];

  if (!activeStudy) {
    return null;
  }

  const goPrev = () => {
    setActiveIndex((index) => (index === 0 ? slides.length - 1 : index - 1));
  };

  const goNext = () => {
    setActiveIndex((index) => (index === slides.length - 1 ? 0 : index + 1));
  };

  return (
    <section className="cs-index-wall cs-container" aria-labelledby="cs-index-wall-heading">
      <h2 id="cs-index-wall-heading" className="cs-index-wall__title">
        Wall of love
      </h2>
      <div className="cs-index-wall__carousel">
        <button
          type="button"
          className="cs-index-wall__nav cs-index-wall__nav--prev"
          onClick={goPrev}
          aria-label="Previous"
        >
          ←
        </button>
        <div className="cs-index-wall__slide">
          <span className="cs-index-wall__tag">Unique plays</span>
          <p className="cs-index-wall__snippet">{activeStudy.wallSnippet}</p>
          <Link
            className="cs-index-wall__link"
            href={`/use-cases/${activeStudy.slug}`}
          >
            Read case study
          </Link>
        </div>
        <button
          type="button"
          className="cs-index-wall__nav cs-index-wall__nav--next"
          onClick={goNext}
          aria-label="Next"
        >
          →
        </button>
      </div>
      <div className="cs-index-wall__dots" role="tablist" aria-label="Wall of love slides">
        {slides.map((study, index) => (
          <button
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            className={`cs-index-wall__dot${index === activeIndex ? " is-active" : ""}`}
            onClick={() => setActiveIndex(index)}
            key={study.slug}
            aria-label={`Slide ${index + 1}: ${study.company}`}
          />
        ))}
      </div>
    </section>
  );
}
