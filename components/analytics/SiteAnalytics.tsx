"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  SECTION_IDS,
  SCROLL_MILESTONES,
  track,
  trackScroll,
  trackSection,
} from "@/lib/analytics";

function observeSections() {
  const seen = new Set<string>();
  const elements: Element[] = [];

  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (el) elements.push(el);
  }
  document.querySelectorAll(".lp-module[id]").forEach((el) => {
    if (!elements.includes(el)) elements.push(el);
  });

  if (!elements.length) return () => {};

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.35) continue;
        const id = entry.target.id;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        trackSection(id);
      }
    },
    { threshold: [0.35], rootMargin: "0px 0px -10% 0px" },
  );

  elements.forEach((el) => io.observe(el));
  return () => io.disconnect();
}

function observeScrollDepth(pathname: string) {
  const fired = new Set<number>();
  const key = `ph_scroll_${pathname}`;

  const onScroll = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const pct = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
    for (const milestone of SCROLL_MILESTONES) {
      if (pct < milestone || fired.has(milestone)) continue;
      fired.add(milestone);
      try {
        const prev = JSON.parse(sessionStorage.getItem(key) || "[]") as number[];
        if (!prev.includes(milestone)) {
          sessionStorage.setItem(key, JSON.stringify([...prev, milestone]));
          trackScroll(milestone);
        } else {
          fired.add(milestone);
        }
      } catch {
        trackScroll(milestone);
      }
    }
  };

  try {
    const prev = JSON.parse(sessionStorage.getItem(key) || "[]") as number[];
    prev.forEach((m) => fired.add(m));
  } catch {
    /* ignore */
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}

function observeOutboundClicks() {
  const onClick = (event: MouseEvent) => {
    const target = event.target as Element | null;
    const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!anchor?.href) return;
    let url: URL;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch {
      return;
    }
    if (url.origin === window.location.origin) return;
    if (!/^https?:$/.test(url.protocol)) return;

    const host = url.hostname;
    let network: string | undefined;
    if (host.includes("linkedin")) network = "linkedin";
    else if (host === "x.com" || host.includes("twitter")) network = "x";

    if (network) {
      track("social_outbound_clicked", {
        network,
        href: url.href,
        location: "outbound_capture",
      });
    }
    track("outbound_link_clicked", {
      href: url.href,
      text: (anchor.textContent || "").trim().slice(0, 120),
      host,
    });
  };

  document.addEventListener("click", onClick, true);
  return () => document.removeEventListener("click", onClick, true);
}

export function SiteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    const cleanups = [
      observeSections(),
      observeScrollDepth(pathname || "/"),
      observeOutboundClicks(),
    ];
    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
