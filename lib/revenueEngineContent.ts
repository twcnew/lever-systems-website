export type GtmLogo =
  | "rb2b"
  | "vector"
  | "hubspot"
  | "attio"
  | "salesforce"
  | "fathom"
  | "predictleads"
  | "crunchbase"
  | "usergems"
  | "linkedin"
  | "commonroom"
  | "builtwith"
  | "clay"
  | "instantly"
  | "aircall"
  | "meta"
  | "google"
  | "google-sheets"
  | "slack"
  | "alpha-signal"
  | "apollo"
  | "n8n"
  | "notion"
  | "lemlist"
  | "gong"
  | "clari"
  | "clearbit"
  | "snitcher"
  | "claude"
  | "theirstack"
  | "sumble"
  | "signalbase"
  | "findymail"
  | "icypeas"
  | "wiza"
  | "bounceban"
  | "fullenrich"
  | "leadmagic"
  | "unipile";

export type RevenueSignal = {
  label: string;
  logos: GtmLogo[];
};

export type RevenueStep = {
  short: string;
  detail?: string;
  stamp?: string;
  review?: boolean;
};

export type RevenueOutput = {
  n: number;
  label: string;
  logos: GtmLogo[];
};

export const REVENUE_ENGINE = {
  signalsTitle: "Revenue signals",
  engineTitle: "AI system",
  outputsTitle: "Routed sequence",
  routingLabel: "Routing",
  signals: [
    { label: "Website activity", logos: ["rb2b", "vector"] },
    { label: "CRM data", logos: ["hubspot", "salesforce", "attio"] },
    { label: "Market signals", logos: ["crunchbase", "theirstack"] },
    { label: "Hiring & job change", logos: ["linkedin", "apollo"] },
    { label: "LinkedIn engagement", logos: ["linkedin"] },
    { label: "Tech-stack change", logos: ["builtwith"] },
  ] satisfies RevenueSignal[],
  steps: [
    { short: "Clean", detail: "Dedupe · Normalize" },
    { short: "Enrich", detail: "Waterfall" },
    { short: "Score", detail: "Fit · Signals stacked" },
    {
      short: "Human in the loop",
      stamp: "APPROVE / IGNORE",
      review: true,
    },
    { short: "Route", detail: "To the play" },
  ] satisfies RevenueStep[],
  outputs: [
    { n: 1, label: "Account list built", logos: ["clay"] },
    { n: 2, label: "Sequence started", logos: ["instantly", "lemlist"] },
    { n: 3, label: "Call queue ready", logos: ["aircall"] },
    { n: 4, label: "Ad audience synced", logos: ["linkedin", "meta", "google"] },
    { n: 5, label: "CRM task created", logos: ["hubspot"] },
    { n: 6, label: "Owner notified", logos: ["slack"] },
  ] satisfies RevenueOutput[],
};
