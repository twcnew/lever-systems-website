import { ABOUT_CONTENT } from "./aboutContent";

export type SolutionStepIcon =
  | "signal"
  | "enrichment"
  | "verification"
  | "outreach"
  | "meeting"
  | "revenue";

export type SolutionStep = {
  id: string;
  label: string;
  icon: SolutionStepIcon;
  defaultActive?: boolean;
};

export type LeverPillar = {
  label: string;
  detail: string;
};

export const SOLUTION_SUB_ANNOTATED = "one GTM owner";
export const SOLUTION_TITLE_ACCENT_ANNOTATED = "One owner.";

export const SOLUTION_CONTENT = {
  label: "The Solution",
  title: "One pipeline.",
  titleAccent: "One owner.",
  sub: "I wire the full motion inside your stack, with one GTM owner who builds it, stays accountable, and hands it to your team.",
  founder: {
    name: ABOUT_CONTENT.founder.name,
    role: ABOUT_CONTENT.founder.role,
  },
  pillars: [
    {
      label: "One interlocutor",
      detail: "Audit, build, handover, same owner from day one to launch.",
    },
    {
      label: "GTM expertise",
      detail: "Clay, signals, routing, CRM. Built in the field, not in slides.",
    },
    {
      label: "Full ownership",
      detail: "I own the logic until workflows run in your team's hands.",
    },
    {
      label: "Your stack",
      detail: "HubSpot, Slack, and the tools you already pay for.",
    },
  ] satisfies LeverPillar[],
  steps: [
    { id: "lead-signal", label: "Lead Signal", icon: "signal" },
    { id: "data-enrichment", label: "Data Enrichment", icon: "enrichment" },
    {
      id: "email-verification",
      label: "Email Verification",
      icon: "verification",
      defaultActive: true,
    },
    { id: "outreach-sequence", label: "Outreach Sequence", icon: "outreach" },
    { id: "meeting-booked", label: "Meeting Booked", icon: "meeting" },
    { id: "revenue-generated", label: "Revenue Generated", icon: "revenue" },
  ] satisfies SolutionStep[],
  cta: {
    label: "Hire an A-player GTM engineer — book a strategy call →",
    href: "#contact",
  },
};
