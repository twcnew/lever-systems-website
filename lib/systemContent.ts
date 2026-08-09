export const SYSTEM_TITLE_ACCENT_ANNOTATED = "Sales action out.";

export type SystemNode = {
  label: string;
  items: string[];
};

export const SYSTEM_CONTENT = {
  label: "The workflow",
  title: "Signals in.",
  titleAccent: "Sales action out.",
  sub: "Every workflow has one job: turn a real market clue into a clear, reviewable next step for the right rep.",
  flow: [
    {
      label: "Sources",
      items: ["CRM", "Clay", "Website", "LinkedIn", "Sales notes"],
    },
    {
      label: "Logic",
      items: ["Fit", "Trigger", "Enrich", "Route"],
    },
    {
      label: "Sales action",
      items: ["Slack alert", "CRM task", "Sequence draft", "Call context"],
    },
  ] satisfies SystemNode[],
  gate: {
    label: "Human check",
    note: "Judgment stays before anything goes out under your name.",
  },
  cta: {
    label: "Wire signals to sales action — book a strategy call →",
    href: "#contact",
  },
};
