export type WaysPanelStep = {
  text: string;
};

export type WaysPanel = {
  header: string;
  badge?: string;
  steps: WaysPanelStep[];
  footnote: string;
};

export type WaysMode = {
  tag: string;
  meta: string;
  title: string;
  body: string;
  linkLabel: string;
  highlight?: boolean;
  panel: WaysPanel;
};

export const WAYS_CONTENT = {
  label: "Two ways to work together",
  items: [
    { text: "Build the system." },
    { text: "Keep it running.", accent: true },
  ],
  intro: [
    { text: "When the pipeline runs as a system, reps get back to selling. No system yet? " },
    { text: "Get it built and handed over", accent: true },
    { text: ". System live but brittle? " },
    { text: "Get it kept current", accent: true },
    { text: ". Same tools. Same motion. Different level of involvement." },
  ],
  modes: [
    {
      tag: "Build with me",
      meta: "Project build",
      title: "Build the System",
      body: "I build the workflows in your stack: signals, routing, handoffs. When they are live, your team owns them.",
      linkLabel: "Build the system",
      panel: {
        header: "I build",
        badge: "You own it",
        steps: [
          { text: "Map what to watch and who acts" },
          { text: "Wire workflows in your tools" },
          { text: "Hand over · documented and live" },
        ],
        footnote: "Your team runs it",
      },
    },
    {
      tag: "Operate with me",
      meta: "Ongoing · or sprint",
      title: "Keep It Running",
      body: "I stay your main GTM contact: feeding workflows, tuning from feedback, optimizing over time. Or I ship one-shot campaigns when you need something now.",
      linkLabel: "Keep it running",
      highlight: true,
      panel: {
        header: "I run it",
        badge: "Your GTM partner",
        steps: [
          { text: "Maintain and feed the system" },
          { text: "Optimize from field feedback" },
          { text: "Or run a one-shot campaign" },
        ],
        footnote: "Long-term · or project sprint",
      },
    },
  ] satisfies WaysMode[],
};
