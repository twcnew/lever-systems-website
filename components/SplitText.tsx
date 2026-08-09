import type { CSSProperties, ReactNode } from "react";

export type Segment = {
  text: string;
  /** wraps this segment in an element with the given class (e.g. "accent") */
  className?: string;
  /** render a <br/> before this segment */
  breakBefore?: boolean;
  /** extra delay (ms) added before this segment's first unit */
  pauseBefore?: number;
};

type SplitTextProps = {
  segments: Segment[];
  /** stagger between units in ms */
  step: number;
  /** split by letter (default) or by word */
  unit?: "letter" | "word";
  /** extra class on the wrapper (the wrapper carries .split-wait) */
  className?: string;
  as?: "h1" | "h2" | "span" | "div";
  style?: CSSProperties;
};

/**
 * Pre-splits text into staggered spans so CSS can reveal them with
 * `animation-delay: var(--d)`. Words stay in nowrap wrappers so lines
 * never break mid-word. The container reveals when it gains `.in`.
 */
export function SplitText({
  segments,
  step,
  unit = "letter",
  className,
  as: Tag = "span",
  style,
}: SplitTextProps) {
  let i = 0;
  let delay = 0;
  const out: ReactNode[] = [];

  segments.forEach((seg, sIdx) => {
    if (seg.breakBefore) out.push(<br key={`br-${sIdx}`} />);
    delay += seg.pauseBefore ?? 0;

    const nodes: ReactNode[] = [];
    for (const word of seg.text.split(/(\s+)/)) {
      if (!word) continue;
      if (/^\s+$/.test(word)) {
        nodes.push(
          <span
            key={`g-${i}`}
            className="lt gap"
            style={{ "--d": `${delay}ms` } as CSSProperties}
          >
            {" "}
          </span>,
        );
        if (unit === "letter") delay += step;
        i++;
        continue;
      }

      if (unit === "word") {
        nodes.push(
          <span key={`w-${i}`} className="w" aria-hidden="true">
            <span
              className="lt"
              style={{ "--d": `${delay}ms` } as CSSProperties}
            >
              {word}
            </span>
          </span>,
        );
        delay += step;
        i++;
        continue;
      }

      nodes.push(
        <span key={`w-${i}`} className="w" aria-hidden="true">
          {[...word].map((ch) => {
            const el = (
              <span
                key={i}
                className="lt"
                style={{ "--d": `${delay}ms` } as CSSProperties}
              >
                {ch}
              </span>
            );
            delay += step;
            i++;
            return el;
          })}
        </span>,
      );
    }

    out.push(
      seg.className ? (
        <span key={`s-${sIdx}`} className={seg.className}>
          {nodes}
        </span>
      ) : (
        <span key={`s-${sIdx}`}>{nodes}</span>
      ),
    );
  });

  const label = segments.map((s) => s.text).join(" ");
  return (
    <Tag
      className={`split-wait${className ? ` ${className}` : ""}`}
      aria-label={label}
      style={style}
    >
      {out}
    </Tag>
  );
}

/** Corner captions in S3: letters slide in horizontally, one word at a time. */
export function CornerText({ text, side }: { text: string; side: "l" | "r" }) {
  const chars = [...text];
  const last = chars.length - 1;
  return (
    <span className={`corner corner-${side}`} aria-label={text}>
      {chars.map((ch, idx) => {
        const order = side === "l" ? idx : last - idx;
        return (
          <span
            key={idx}
            className={`lt${ch === " " ? " gap" : ""}`}
            style={{ "--d": `${order * 120}ms` } as CSSProperties}
          >
            {ch === " " ? " " : ch}
          </span>
        );
      })}
    </span>
  );
}
