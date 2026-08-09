import type { GtmLogo } from "@/lib/revenueEngineContent";

export type PlayMotionStep = {
  label: string;
  tools: GtmLogo[];
};

export type PlayMotionOutput = {
  n: number;
  label: string;
  detail: string;
  logos?: GtmLogo[];
};

export type PlayMotion = {
  slug: string;
  title: string;
  inputs: string[];
  steps: PlayMotionStep[];
  outputs: PlayMotionOutput[];
};

export const PLAYS_TITLE_ACCENT_ANNOTATED = "One clear next move.";
export const PLAYS_SUB_ANNOTATED = "signal in, routed action out.";

export const PLAYS_CONTENT = {
  label: "Plays",
  title: "One real clue.",
  titleAccent: "One clear next move.",
  sub: "Three channels. Same logic underneath: signal in, routed action out.",
  motions: [
    {
      slug: "outbound",
      title: "Outbound",
      inputs: ["ICP rules", "TAM scope", "Email infra"],
      steps: [
        { label: "Play & signal pick", tools: ["clay", "linkedin"] },
        { label: "Company & contact sourcing", tools: ["apollo", "clay", "findymail", "icypeas"] },
        { label: "Lead scoring & tiering", tools: ["hubspot", "n8n"] },
      ],
      outputs: [
        { n: 1, label: "Omnichannel", detail: "Email + LinkedIn + call", logos: ["instantly", "lemlist", "linkedin"] },
        { n: 2, label: "Multichannel", detail: "Email + LinkedIn" },
        { n: 3, label: "Email nurture", detail: "Light-touch sequence" },
      ],
    },
    {
      slug: "inbound",
      title: "Inbound",
      inputs: ["Form submit", "Website visits", "Product usage"],
      steps: [
        { label: "Enrich & dedupe", tools: ["clay", "hubspot", "fullenrich"] },
        { label: "Fit & trigger check", tools: ["hubspot", "n8n"] },
        { label: "Route to owner", tools: ["slack", "hubspot"] },
      ],
      outputs: [
        { n: 1, label: "Hot · Slack alert", detail: "Rep + context + draft" },
        { n: 2, label: "Warm · CRM task", detail: "Fit score + next step" },
        { n: 3, label: "Cold · Sequence", detail: "Low-touch follow-up" },
      ],
    },
    {
      slug: "ads",
      title: "Ads",
      inputs: ["ICP list", "Site visitors", "CRM segments"],
      steps: [
        { label: "Audience build", tools: ["clay", "linkedin"] },
        { label: "Creative match", tools: ["meta", "google"] },
        { label: "Sync to platform", tools: ["linkedin", "hubspot"] },
      ],
      outputs: [
        {
          n: 1,
          label: "ABM audience",
          detail: "Matched accounts live",
          logos: ["linkedin"],
        },
        {
          n: 2,
          label: "Retarget",
          detail: "Site visitors + engagers",
          logos: ["meta"],
        },
        {
          n: 3,
          label: "Lookalike expand",
          detail: "CRM seed → new reach",
          logos: ["google"],
        },
      ],
    },
  ] satisfies PlayMotion[],
  cta: {
    label: "Pick your next play — book a strategy call →",
    href: "#contact",
  },
};
