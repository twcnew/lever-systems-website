import type { ComponentType } from "react";

export type CaseStudyQuote = {
  text: string;
  author: string;
  role: string;
  avatarSrc?: string;
  signatureSrc?: string;
};

export type CaseStudyMetric = {
  value: string;
  label: string;
  variant?: "violet" | "blue";
};

export type CaseStudyVisual = {
  src?: string;
  alt: string;
  caption?: string;
};

export type CaseStudyUseCase = {
  number: string;
  title: string;
  /** Substring of title wrapped with InkAnnotate underline. */
  titleAccent?: string;
  navLabel?: string;
  body: string[];
  quote?: CaseStudyQuote;
  bullets?: string[];
  visual?: CaseStudyVisual;
};

export type CaseStudyIndexCard = {
  headline: string;
  imageSrc?: string;
};

export type CaseStudy = {
  slug: string;
  logoId: "swan" | "flex" | "happypal";
  company: string;
  /** Shorter label for hero logo strip when company name is long. */
  shortName?: string;
  brandColor: string;
  /** Hero wash; defaults to brandColor. Use a dark value for black heroes. */
  heroBackground?: string;
  heroHeadline: string;
  heroImage?: CaseStudyVisual;
  sideNavImage?: CaseStudyVisual;
  heroMetrics: CaseStudyMetric[];
  companyDescription: string;
  websiteUrl?: string;
  industry: string;
  headquarters: string;
  heroQuote: string;
  intro: string[];
  featuredQuote: CaseStudyQuote;
  /** Primary metric on homepage proof board. */
  proofMetric: CaseStudyMetric;
  /** Markdown-capable quote for hero logo popover (**bold**). */
  heroPopoverQuote?: string;
  impactHighlights: string[];
  problem: { title: string; titleAccent?: string; body: string[] };
  solution: { title: string; titleAccent?: string; body: string[] };
  useCases: CaseStudyUseCase[];
  impact: {
    title: string;
    titleAccent?: string;
    body: string[];
    quote?: CaseStudyQuote;
    metrics?: CaseStudyMetric[];
  };
  indexCard: CaseStudyIndexCard;
  wallSnippet: string;
  relatedSlugs: string[];
  relatedSubtitle?: string;
  seo: { title: string; description: string };
};

export type CaseStudyNavItem = {
  id: string;
  label: string;
};

export type CaseStudyLogoMap = Record<
  CaseStudy["logoId"],
  { Logo: ComponentType; markClass: string }
>;
