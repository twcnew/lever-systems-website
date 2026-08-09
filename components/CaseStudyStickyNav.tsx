"use client";

import { useEffect, useRef, useState } from "react";
import type { CaseStudyNavItem } from "@/lib/caseStudies/types";
import { smoothScrollBehavior } from "@/lib/prefersReducedMotion";
import { track } from "@/lib/analytics";

type CaseStudyStickyNavProps = {
  items: CaseStudyNavItem[];
};

export function CaseStudyStickyNav({ items }: CaseStudyStickyNavProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const viewedRef = useRef(new Set<string>());

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null);

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          const id = visible[0].target.id;
          setActiveId(id);
          if (!viewedRef.current.has(id)) {
            viewedRef.current.add(id);
            track("case_section_viewed", { section_id: id });
          }
        }
      },
      {
        rootMargin:
          window.innerWidth <= 900 ? "-12% 0px -45% 0px" : "-20% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string, label: string) => {
    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    track("case_sticky_nav_clicked", { section_id: id, label });

    const topNav = document.querySelector(".topnav");
    const offset = (topNav?.getBoundingClientRect().height ?? 0) + 24;

    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: smoothScrollBehavior() });
    setActiveId(id);
  };

  return (
    <nav className="cs-side-nav__links" aria-label="Case study sections">
      <ul className="cs-side-nav__list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`cs-side-nav__link${activeId === item.id ? " is-active" : ""}`}
              onClick={() => handleClick(item.id, item.label)}
            >
              <span
                className={`cs-side-nav__dot${activeId === item.id ? " is-on" : ""}`}
                aria-hidden="true"
              />
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
