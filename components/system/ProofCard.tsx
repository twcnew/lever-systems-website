"use client";

import Link from "next/link";
import { CASE_STUDY_LOGOS } from "@/lib/caseStudies";
import { withBasePath } from "@/lib/basePath";
import type { ProofShowcaseItem } from "@/lib/proofShowcase";
import { track } from "@/lib/analytics";
import { ProofAttributionBand } from "./ProofAttributionBand";

export type ProofCardSource =
  | "homepage_proof"
  | "use_cases_index"
  | "case_study_related";

type ProofCardProps = {
  item: ProofShowcaseItem;
  body?: "quote" | "overview";
  source: ProofCardSource;
};

export function ProofCard({ item, body = "quote", source }: ProofCardProps) {
  const { Logo } = CASE_STUDY_LOGOS[item.logoId];
  const isOverview = body === "overview";

  return (
    <Link
      className="proof-board__cell"
      data-slug={item.slug}
      href={item.href}
      onClick={() =>
        track("proof_card_clicked", {
          slug: item.slug,
          source,
          href: item.href,
        })
      }
    >
      {isOverview ? (
        <p className="proof-board__quote proof-board__quote--overview">
          {item.overview}
        </p>
      ) : (
        <blockquote className="proof-board__quote">
          &ldquo;{item.quote}&rdquo;
        </blockquote>
      )}

      <div className="proof-board__rule" aria-hidden="true" />

      <ProofAttributionBand
        author={item.author}
        role={item.role}
        initials={item.initials}
        avatarSrc={item.avatarSrc}
        signatureSrc={item.signatureSrc}
        Logo={Logo}
      />

      {(item.avatarSrc || item.initials) && (
        <div className="proof-board__portrait" aria-hidden="true">
          {item.avatarSrc ? (
            <img
              src={withBasePath(item.avatarSrc)}
              alt=""
              decoding="async"
              loading="lazy"
              width={336}
              height={490}
            />
          ) : (
            <span className="proof-board__portrait-fallback">{item.initials}</span>
          )}
        </div>
      )}

      <span className="proof-board__go">Read case →</span>
    </Link>
  );
}
