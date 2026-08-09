export type LeverPillar = {
  label: string;
  detail: string;
};

import { ABOUT_CONTENT } from "./aboutContent";

export const COMPARE_CONTENT = {
  label: "Why Lever",
  title: "The real lever",
  titleAccent: "is just me.",
  sub: "Not another seat, tool, or agency layer. One GTM owner who maps your motion, wires the workflows, and stays accountable until your team runs it.",
  founder: {
    name: ABOUT_CONTENT.founder.name,
    role: ABOUT_CONTENT.founder.role,
  },
  pillars: [
    {
      label: "One interlocutor",
      detail: "Audit, build, handover — same owner from day one to launch.",
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
      detail: "HubSpot, Slack, and the tools you already pay for. No rip-and-replace.",
    },
  ] satisfies LeverPillar[],
};
