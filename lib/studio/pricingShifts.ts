export type PricingModelId = "outcome" | "usage" | "hybrid";

export type PricingCompany = {
  id: string;
  name: string;
  pricing: string;
};

export type PricingModel = {
  id: PricingModelId;
  label: string;
  description: string;
  companies: PricingCompany[];
};

export const PRICING_SHIFTS_TITLE = "How pricing shifts your GTM strategy";
export const PRICING_SHIFTS_TITLE_ACCENT = "GTM strategy";
export const PRICING_SHIFTS_KICKER =
  "19 companies moving away from seat-based pricing";
export const PRICING_SHIFTS_KICKER_ACCENT = "19 companies";

export const PRICING_MODELS: PricingModel[] = [
  {
    id: "outcome",
    label: "Outcome-based",
    description: "Only pay when the product delivers a result",
    companies: [
      {
        id: "harvey",
        name: "Harvey",
        pricing: "Per AI-generated legal deliverable",
      },
      {
        id: "decagon",
        name: "Decagon",
        pricing: "Per resolution or per conversation",
      },
      {
        id: "intercom",
        name: "Intercom",
        pricing: "$0.99 per AI resolution",
      },
      {
        id: "zendesk",
        name: "Zendesk",
        pricing: "Per successful autonomous resolution",
      },
      {
        id: "sierra",
        name: "Sierra",
        pricing: "Per complex task",
      },
    ],
  },
  {
    id: "usage",
    label: "Usage-based",
    description: "Pay per unit of work delivered",
    companies: [
      {
        id: "salesforce",
        name: "Salesforce",
        pricing: "$2 per conversation (Agentforce)",
      },
      {
        id: "openai",
        name: "OpenAI",
        pricing: "Per input / output token",
      },
      {
        id: "microsoft",
        name: "Microsoft",
        pricing: "$4 per hour of AI usage",
      },
      { id: "11x", name: "11x", pricing: "Per task by AI SDR" },
      { id: "zapier", name: "Zapier", pricing: "Per task automated" },
      {
        id: "elevenlabs",
        name: "ElevenLabs",
        pricing: "Per minute of AI generated",
      },
      {
        id: "bland",
        name: "Bland",
        pricing: "Per minute of AI phone call",
      },
    ],
  },
  {
    id: "hybrid",
    label: "Hybrid / credits",
    description: "Platform fee + consumption layer",
    companies: [
      {
        id: "clay",
        name: "Clay",
        pricing: "Data at cost + actions per workflow",
      },
      {
        id: "unify",
        name: "Unify",
        pricing: "Credits = data points + signals",
      },
      {
        id: "monday",
        name: "Monday.com",
        pricing: "Seats + AI credit layer",
      },
      {
        id: "relay",
        name: "Relay.app",
        pricing: "Workflow steps + AI credits",
      },
      {
        id: "relevance",
        name: "Relevance AI",
        pricing: "Platform + usage credits",
      },
      {
        id: "kittl",
        name: "Kittl",
        pricing: "Editor seats + usage credits",
      },
      {
        id: "aisdr",
        name: "AiSDR",
        pricing: "Tied to meetings booked",
      },
    ],
  },
];

export const PRICING_SHIFTS_CTA =
  "Pricing is not packaging. It rewrites the GTM motion.";
export const PRICING_SHIFTS_CTA_ACCENT = "rewrites the GTM motion.";
