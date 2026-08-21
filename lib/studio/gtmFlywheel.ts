export type FlywheelCircle = {
  id: "content" | "ads" | "outbound";
  label: string;
  points: string[];
};

export type FlywheelFailure = {
  id: string;
  pair: string;
  label: string;
  pos: { top: string; left: string };
};

export type FlywheelStep = {
  n: number;
  text: string;
};

export const FLYWHEEL_TITLE = "The GTM Flywheel";
export const FLYWHEEL_TITLE_ACCENT = "Flywheel";
export const FLYWHEEL_KICKER =
  "Run one channel and pipeline plateaus. Run 3 and it multiplies.";
export const FLYWHEEL_KICKER_ACCENT = "multiplies";

export const FLYWHEEL_CENTER = "GTM Flywheel";
export const FLYWHEEL_CENTER_SUB =
  "Same ICP. Three channels. Each makes the others stronger.";

export const FLYWHEEL_CIRCLES: FlywheelCircle[] = [
  {
    id: "content",
    label: "Content",
    points: [
      "Trust before the ask",
      "Earns recall",
      "Warms the room",
      "Earns AI citations",
      "Lowers ad CAC",
    ],
  },
  {
    id: "ads",
    label: "Ads",
    points: [
      "Retargets readers",
      "Stays visible in ICP",
      "Surfaces offers",
      "Shortens cold to warm",
      "Top of mind between touches",
    ],
  },
  {
    id: "outbound",
    label: "Outbound",
    points: [
      "Books named meetings",
      "Hits live triggers",
      "Personalizes around events",
      "Reaches demand others miss",
      "Pulls timeline forward",
    ],
  },
];

export const FLYWHEEL_FAILURES: FlywheelFailure[] = [
  {
    id: "content-ads",
    pair: "Content + Ads",
    label: "Loud, not converting",
    pos: { top: "30%", left: "50%" },
  },
  {
    id: "content-outbound",
    pair: "Content + Outbound",
    label: "Outreach into cold ground",
    pos: { top: "62%", left: "33%" },
  },
  {
    id: "ads-outbound",
    pair: "Ads + Outbound",
    label: "Spending without trust",
    pos: { top: "62%", left: "67%" },
  },
];

export const FLYWHEEL_STEPS: FlywheelStep[] = [
  { n: 1, text: "Single-channel outbound has a ceiling. Stack three to remove it." },
  { n: 2, text: "Match the ICP across all three. Same people, three touches." },
  { n: 3, text: "Time outbound to content peaks. Recall is at max." },
  { n: 4, text: "Show ads to outbound lists before the email lands." },
  { n: 5, text: "Measure pipeline, not channel metrics. Channel KPIs lie." },
];
