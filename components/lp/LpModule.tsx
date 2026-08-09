"use client";

import type { ReactNode } from "react";
import { useSectionReveal } from "../sections/useSectionReveal";

type LpModuleProps = {
  id?: string;
  className?: string;
  label?: string;
  title: string;
  titleAccent?: ReactNode;
  sub?: ReactNode;
  visual?: ReactNode;
  children?: ReactNode;
};

export function LpModule({
  id,
  className = "",
  label,
  title,
  titleAccent,
  sub,
  visual,
  children,
}: LpModuleProps) {
  const ref = useSectionReveal<HTMLElement>();

  return (
    <section className={`lp-module ${className}`.trim()} id={id} ref={ref}>
      <div className="lp-module__inner">
        <div className={`lp-module__grid${visual ? " lp-module__grid--split" : ""}`}>
          <div className="lp-module__copy">
            {label && <span className="lp-module__label">{label}</span>}
            <h2 className="lp-module__title">
              {title}
              {titleAccent && (
                <>
                  <br />
                  <span className="lp-module__title-accent">{titleAccent}</span>
                </>
              )}
            </h2>
            {sub && <p className="lp-module__sub">{sub}</p>}
          </div>
          {visual && <div className="lp-module__visual">{visual}</div>}
        </div>
        {children && <div className="lp-module__body">{children}</div>}
      </div>
    </section>
  );
}
