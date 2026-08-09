import type { ComponentType } from "react";
import { withBasePath } from "@/lib/basePath";

type ProofAttributionBandProps = {
  author: string;
  role: string;
  initials: string;
  avatarSrc?: string;
  signatureSrc?: string;
  Logo: ComponentType;
};

export function ProofAttributionBand({
  author,
  role,
  initials,
  avatarSrc,
  signatureSrc,
  Logo,
}: ProofAttributionBandProps) {
  return (
    <div className="proof-attribution">
      <div className="proof-attribution__sig">
        <span className="proof-attribution__label">Endorsed by</span>
        {signatureSrc ? (
          <img
            className="proof-attribution__signature"
            src={withBasePath(signatureSrc)}
            alt={author}
            decoding="async"
          />
        ) : (
          <span className="proof-attribution__name-ink">{author}</span>
        )}
        <span className="proof-attribution__role">{role}</span>
      </div>
      <div className="proof-attribution__logo" aria-hidden="true">
        <Logo />
      </div>
    </div>
  );
}
