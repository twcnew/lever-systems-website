import { CASE_STUDIES } from "./caseStudies";
import type { CaseStudy } from "./caseStudies/types";
import { HERO_LOGO_ENTRIES } from "./heroLogoStrip";

export type ProofShowcaseItem = {
  slug: string;
  company: string;
  brandColor: string;
  headline: string;
  quote: string;
  /** Short “what’s inside” line for the /use-cases index grid. */
  overview: string;
  author: string;
  role: string;
  initials: string;
  avatarSrc?: string;
  signatureSrc?: string;
  metric: { value: string; label: string };
  href: string;
  logoId: CaseStudy["logoId"];
};

/** Curated homepage metrics — add a slug here when a new case study ships. */
const PROOF_METRICS: Record<CaseStudy["logoId"], { value: string; label: string }> = {
  swan: { value: "~5", label: "people of triage automated" },
  flex: { value: "12+", label: "meetings / week" },
  happypal: { value: "10+", label: "qualified meetings / week" },
};

/** What’s inside each case — used on /use-cases index instead of the quote. */
const PROOF_OVERVIEWS: Record<CaseStudy["logoId"], string> = {
  swan: "Inbound routing, CRM hygiene, and self-serve RevOps briefs",
  flex: "Signal-led outbound across jobs, GitHub, and LinkedIn",
  happypal: "CSE detection from domain to outreach, on autopilot",
};

function isTodo(value: string) {
  return value.startsWith("[TODO");
}

function stripBold(text: string) {
  return text.replace(/\*\*/g, "");
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function buildProofShowcaseItems(): ProofShowcaseItem[] {
  return CASE_STUDIES.map((study) => {
    const hero = HERO_LOGO_ENTRIES.find((entry) => entry.id === study.slug);
    const fallback = hero?.testimonial;

    const quote = !isTodo(study.featuredQuote.text)
      ? study.featuredQuote.text
      : fallback
        ? stripBold(fallback.quote)
        : study.wallSnippet;

    const author = !isTodo(study.featuredQuote.author)
      ? study.featuredQuote.author
      : (fallback?.author ?? study.featuredQuote.author);

    const role = !isTodo(study.featuredQuote.role)
      ? study.featuredQuote.role
      : (fallback?.role ?? study.featuredQuote.role);

    const avatarSrc = study.featuredQuote.avatarSrc ?? fallback?.avatarSrc;
    const signatureSrc = study.featuredQuote.signatureSrc;
    const initials = fallback?.initials ?? initialsFromName(author);

    return {
      slug: study.slug,
      company: study.company,
      brandColor: study.brandColor,
      headline: study.indexCard.headline,
      quote,
      overview: PROOF_OVERVIEWS[study.logoId],
      author,
      role,
      initials,
      avatarSrc,
      signatureSrc,
      metric: PROOF_METRICS[study.logoId],
      href: `/use-cases/${study.slug}`,
      logoId: study.logoId,
    };
  });
}
