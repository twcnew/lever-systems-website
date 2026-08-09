import posthog from "posthog-js";

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

const LANDING_KEY = "ph_landing_page";
const SESSION_LANDING_KEY = "ph_session_landing_sent";

function utmFromSearch(search: string): Record<string, string> {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const out: Record<string, string> = {};
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ] as const) {
    const value = params.get(key);
    if (value) out[key] = value;
  }
  return out;
}

function commonProps(): AnalyticsProps {
  if (typeof window === "undefined") return {};
  const path = window.location.pathname;
  const search = window.location.search;
  const caseMatch = path.match(/^\/use-cases\/([^/]+)\/?$/);
  return {
    path,
    page_path: path,
    page_url: window.location.href,
    case_slug: caseMatch?.[1] ?? null,
    referrer: document.referrer || undefined,
    ...utmFromSearch(search),
  };
}

export function track(event: string, properties?: AnalyticsProps) {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, { ...commonProps(), ...properties });
}

export function trackCta(props: {
  cta_id: string;
  label: string;
  location: string;
  href: string;
}) {
  track("cta_clicked", props);
}

export function trackNav(props: {
  label: string;
  href: string;
  surface: "topnav" | "drawer";
}) {
  track("nav_link_clicked", props);
}

export function trackCase(event: string, props?: AnalyticsProps) {
  track(event, props);
}

export function trackCal(event: string, props?: AnalyticsProps) {
  track(event, { location: "closing", ...props });
}

export function trackSection(sectionId: string) {
  track("section_viewed", { section_id: sectionId });
}

export function trackScroll(depth: number) {
  track("scroll_depth", { depth });
}

/** Call on each $pageview to attach UTMs + one-time session_landing. */
export function enrichPageviewProps(pathname: string, search: string): AnalyticsProps {
  const qs = search.startsWith("?") ? search.slice(1) : search;
  const full = qs ? `${pathname}?${qs}` : pathname;
  let landing = sessionStorage.getItem(LANDING_KEY);
  if (!landing) {
    landing = full;
    sessionStorage.setItem(LANDING_KEY, landing);
  }
  const props: AnalyticsProps = {
    path: pathname,
    page_path: pathname,
    $current_url: full,
    landing_page: landing,
    referrer: document.referrer || undefined,
    ...utmFromSearch(qs),
  };
  if (!sessionStorage.getItem(SESSION_LANDING_KEY)) {
    sessionStorage.setItem(SESSION_LANDING_KEY, "1");
    track("session_landing", props);
  }
  return props;
}

export const SECTION_IDS = [
  "problem",
  "solution",
  "how",
  "plays",
  "proof",
  "faq",
  "contact",
  "customers",
  "related-proof",
] as const;

export const SCROLL_MILESTONES = [25, 50, 75, 90, 100] as const;
