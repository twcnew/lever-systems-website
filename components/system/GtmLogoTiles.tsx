import { gtmLogoSrc } from "@/lib/gtmLogoSrc";
import type { GtmLogo } from "@/lib/revenueEngineContent";

type GtmLogoTilesProps = {
  logos: GtmLogo[];
  className?: string;
};

export function GtmLogoTiles({ logos, className = "" }: GtmLogoTilesProps) {
  return (
    <span className={`rev-engine__tiles${className ? ` ${className}` : ""}`}>
      {logos.map((logo) => (
        <span className="rev-engine__tile" key={logo}>
          <img src={gtmLogoSrc(logo)} alt="" loading="lazy" />
        </span>
      ))}
    </span>
  );
}
