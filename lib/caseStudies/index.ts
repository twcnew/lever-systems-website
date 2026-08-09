import { FlexLogo } from "@/components/logos/FlexLogo";
import { HappyPalLogo } from "@/components/logos/HappyPalLogo";
import { SwanLogo } from "@/components/logos/SwanLogo";
import { flexCaseStudy } from "./flex";
import { happypalCaseStudy } from "./happypal";
import { swanCaseStudy } from "./swan";
import type { CaseStudy, CaseStudyLogoMap, CaseStudyNavItem } from "./types";

export const CASE_STUDIES: CaseStudy[] = [
  swanCaseStudy,
  flexCaseStudy,
  happypalCaseStudy,
];

export const CASE_STUDY_LOGOS: CaseStudyLogoMap = {
  swan: { Logo: SwanLogo, markClass: "cs-glance__logo-mark--swan" },
  flex: { Logo: FlexLogo, markClass: "cs-glance__logo-mark--flex" },
  happypal: { Logo: HappyPalLogo, markClass: "cs-glance__logo-mark--happypal" },
};

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((study) => study.slug === slug);
}

export function getCaseStudyNavItems(study: CaseStudy): CaseStudyNavItem[] {
  return [
    { id: "at-a-glance", label: "At a glance" },
    { id: "problem", label: "The problem" },
    { id: "solution", label: "The solution" },
    ...study.useCases.map((useCase) => ({
      id: `use-case-${useCase.number}`,
      label: useCase.navLabel ?? useCase.title,
    })),
    { id: "impact", label: "Impact" },
  ];
}

export function getRelatedCaseStudies(study: CaseStudy): CaseStudy[] {
  return study.relatedSlugs
    .map((slug) => getCaseStudy(slug))
    .filter((item): item is CaseStudy => item !== undefined);
}
