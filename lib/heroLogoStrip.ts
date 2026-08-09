import type { ComponentType } from "react";
import { FlexLogo } from "@/components/logos/FlexLogo";
import { HappyPalLogo } from "@/components/logos/HappyPalLogo";
import { SwanLogo } from "@/components/logos/SwanLogo";

export type HeroLogoTestimonial = {
  quote: string;
  author: string;
  role: string;
  initials: string;
  avatarSrc?: string;
};

export type HeroLogoEntry = {
  id: string;
  name: string;
  Logo: ComponentType;
  markClass: string;
  testimonial: HeroLogoTestimonial;
  caseStudyHref?: string;
};

export const HERO_LOGO_ENTRIES: HeroLogoEntry[] = [
  {
    id: "swan",
    name: "Swan",
    Logo: SwanLogo,
    markClass: "hero__logo-mark--swan",
    caseStudyHref: "/use-cases/swan",
    testimonial: {
      quote:
        "No BDR desk on inbound. About **~5 people of triage** in the system. Plus board-ready market sizing and agents that keep running.",
      author: "Bastien Roche",
      role: "Senior RevOps",
      initials: "BR",
      avatarSrc: "/testimonials/bastien-roche-swan.webp",
    },
  },
  {
    id: "flex",
    name: "FlexAI",
    Logo: FlexLogo,
    markClass: "hero__logo-mark--flex",
    caseStudyHref: "/use-cases/flex",
    testimonial: {
      quote: "Finally **technical buyer coverage** without generic playbooks.",
      author: "Thomas Chen",
      role: "Director GTM",
      initials: "TC",
    },
  },
  {
    id: "happypal",
    name: "HappyPal",
    Logo: HappyPalLogo,
    markClass: "hero__logo-mark--happypal",
    caseStudyHref: "/use-cases/happypal",
    testimonial: {
      quote:
        "From kickoff to **10+ qualified meetings a week** — the system finally matches our ICP complexity.",
      author: "Eddy Frodé",
      role: "CEO",
      initials: "EF",
      avatarSrc: "/testimonials/eddy-frode-happypal.webp",
    },
  },
];
