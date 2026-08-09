import Link from "next/link";
import { CASE_STUDY_LOGOS } from "@/lib/caseStudies";
import { withBasePath } from "@/lib/basePath";
import type { ProofShowcaseItem } from "@/lib/proofShowcase";
import { ProofAttributionBand } from "./ProofAttributionBand";

type ProofCardProps = {
  item: ProofShowcaseItem;
  body?: "quote" | "overview";
};

export function ProofCard({ item, body = "quote" }: ProofCardProps) {
  const { Logo } = CASE_STUDY_LOGOS[item.logoId];
  const isOverview = body === "overview";

  return (
    <Link className="proof-board__cell" data-slug={item.slug} href={item.href}>
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
