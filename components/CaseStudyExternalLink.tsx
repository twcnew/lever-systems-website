"use client";

import { track } from "@/lib/analytics";

type CaseStudyExternalLinkProps = {
  company: string;
  slug: string;
  url: string;
};

export function CaseStudyExternalLink({
  company,
  slug,
  url,
}: CaseStudyExternalLinkProps) {
  return (
    <a
      className="cs-glance__link"
      href={url}
      rel="noopener noreferrer"
      target="_blank"
      onClick={() =>
        track("case_external_site_clicked", {
          company,
          url,
          slug,
        })
      }
    >
      Visit {company} ↗
    </a>
  );
}
