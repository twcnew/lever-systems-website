import { withBasePath } from "@/lib/basePath";
import { COLDIQ_MARKETPLACE_PROVIDERS } from "@/lib/coldiqMarketplace";
import type { GtmLogo } from "@/lib/revenueEngineContent";

const ROOT_LOGO_EXT: Partial<Record<GtmLogo, "png" | "svg">> = {
  rb2b: "png",
  vector: "png",
  hubspot: "png",
  attio: "png",
  salesforce: "png",
  fathom: "png",
  predictleads: "png",
  crunchbase: "png",
  usergems: "png",
  linkedin: "png",
  commonroom: "png",
  builtwith: "png",
  clay: "png",
  instantly: "png",
  aircall: "svg",
  meta: "svg",
  google: "png",
  "google-sheets": "png",
  slack: "png",
  "alpha-signal": "svg",
  apollo: "png",
  n8n: "png",
  notion: "png",
  lemlist: "png",
  gong: "png",
  clari: "svg",
  clearbit: "png",
  snitcher: "svg",
  claude: "png",
};

const marketplaceLogoBySlug = new Map<string, string>(
  COLDIQ_MARKETPLACE_PROVIDERS.map((provider) => [
    provider.slug,
    provider.logoFile,
  ]),
);

export function gtmLogoSrc(name: GtmLogo) {
  const rootExt = ROOT_LOGO_EXT[name];
  if (rootExt) {
    return withBasePath(`/gtm/${name}.${rootExt}`);
  }

  const marketplaceFile = marketplaceLogoBySlug.get(name);
  if (marketplaceFile) {
    return withBasePath(`/gtm/marketplace/${marketplaceFile}`);
  }

  return withBasePath(`/gtm/marketplace/${name}.png`);
}
