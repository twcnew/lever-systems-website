"use client";

import { useState } from "react";
import {
  FAQ_CONTENT,
  FAQ_TITLE_ACCENT_ANNOTATED,
} from "@/lib/faqContent";
import { InkAnnotate } from "../system/InkAnnotate";
import { LpModule } from "../lp/LpModule";

function annotatedTitleAccent(titleAccent: string) {
  if (!titleAccent.includes(FAQ_TITLE_ACCENT_ANNOTATED)) {
    return titleAccent;
  }

  const before = titleAccent.slice(
    0,
    titleAccent.indexOf(FAQ_TITLE_ACCENT_ANNOTATED),
  );
  const after = titleAccent.slice(
    titleAccent.indexOf(FAQ_TITLE_ACCENT_ANNOTATED) + FAQ_TITLE_ACCENT_ANNOTATED.length,
  );

  return (
    <>
      {before}
      <InkAnnotate variant="underline">
        {FAQ_TITLE_ACCENT_ANNOTATED}
      </InkAnnotate>
      {after}
    </>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { label, title, titleAccent, items } = FAQ_CONTENT;

  return (
    <LpModule
      id="faq"
      className="lp-module--faq"
      label={label}
      title={title}
      titleAccent={titleAccent ? annotatedTitleAccent(titleAccent) : undefined}
    >
      <div className="lp-faq">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              className={`lp-faq__item${isOpen ? " is-open" : ""}`}
              key={item.question}
            >
              <button
                className="lp-faq__question"
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>{item.question}</span>
                <span className="lp-faq__icon" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              <div className="lp-faq__answer" hidden={!isOpen}>
                <p>{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </LpModule>
  );
}
