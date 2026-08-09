"use client";

import { withBasePath } from "@/lib/basePath";
import { STACK_STRIP_CONTENT } from "@/lib/stackStripContent";
import { LpModule } from "../../lp/LpModule";

function StackItem({ label, src }: { label: string; src: string }) {
  return (
    <span className="stack-strip__item">
      <img
        className="stack-strip__icon"
        src={withBasePath(src)}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <span className="stack-strip__name">{label}</span>
    </span>
  );
}

export function StackStripSection() {
  const { label, title, tools } = STACK_STRIP_CONTENT;
  const track = [...tools, ...tools];

  return (
    <LpModule className="lp-module--stack" label={label} title={title}>
      <div className="stack-strip__viewport">
        <div className="stack-strip__fade stack-strip__fade--left" aria-hidden="true" />
        <div className="stack-strip__fade stack-strip__fade--right" aria-hidden="true" />
        <div className="stack-strip__track" aria-hidden="true">
          {track.map((tool, index) => (
            <StackItem
              key={`${tool.id}-${index}`}
              label={tool.label}
              src={tool.src}
            />
          ))}
        </div>
        <ul className="stack-strip__sr-only">
          {tools.map((tool) => (
            <li key={tool.id}>{tool.label}</li>
          ))}
        </ul>
      </div>
    </LpModule>
  );
}
