export type FlywheelChannel = {
  id: "content" | "ads" | "outbound";
  label: string;
  points: string[];
};

export type FlywheelOverlap = {
  id: "content-ads" | "content-outbound" | "ads-outbound";
  pair: string;
  title: string;
  copy: string;
};

export type FlywheelStep = {
  n: 1 | 2 | 3 | 4 | 5;
  title: string;
  copy: string;
};

export const FLYWHEEL_TITLE = "How Pipeline Multiplies in 2026";
export const FLYWHEEL_TITLE_ACCENT = "Pipeline Multiplies";
export const FLYWHEEL_KICKER =
  "Run one channel and pipeline plateaus. Run 3 and it multiplies.";
export const FLYWHEEL_KICKER_ACCENT = "Run 3 and it multiplies.";

export const FLYWHEEL_CENTER = "The GTM Flywheel";
export const FLYWHEEL_CENTER_SUB =
  "When content, ads and outbound hit the same ICP, every channel makes the others stronger. Buyers see you, trust you, then hear from you at the right moment.";

export const FLYWHEEL_CTA =
  "One ICP. Three channels. Pipeline compounds.";
export const FLYWHEEL_CTA_ACCENT = "Pipeline compounds.";

export const FLYWHEEL_CHANNELS: FlywheelChannel[] = [
  {
    id: "content",
    label: "Content",
    points: [
      "Builds trust before the first ask.",
      "Earns AI citations and search visibility.",
      "Compounds social proof across LinkedIn feeds.",
      "Educates buyers months before they are ready.",
      "Lowers ad CAC by warming the audience.",
    ],
  },
  {
    id: "ads",
    label: "Ads",
    points: [
      "Retargets people who just read your content.",
      "Keeps your brand visible inside the ICP.",
      "Surfaces offers to in-market accounts.",
      "Shortens the gap from cold to warm.",
      "Stays top of mind between outbound touches.",
    ],
  },
  {
    id: "outbound",
    label: "Outbound",
    points: [
      "Books meetings with named target accounts.",
      "Reaches prospects when buying signals appear.",
      "Personalizes around live trigger events.",
      "Surfaces demand other channels cannot reach.",
      "Pulls the timeline forward on in-market accounts.",
    ],
  },
];

export const FLYWHEEL_OVERLAPS: FlywheelOverlap[] = [
  {
    id: "content-ads",
    pair: "Content + Ads",
    title: "Loud but not converting",
    copy: "Big audience and brand recall, but no direct path to booked meetings. Pipeline stays flat while costs climb.",
  },
  {
    id: "content-outbound",
    pair: "Content + Outbound",
    title: "Outreach into cold ground",
    copy: "The email lands, but the recipient never saw you elsewhere. No recall, slower trust build, lower booking rates.",
  },
  {
    id: "ads-outbound",
    pair: "Ads + Outbound",
    title: "Spending without trust",
    copy: "Warm clicks meet cold senders. Buyers do not recognize you. Reply rates collapse and ad spend is wasted.",
  },
];

export const FLYWHEEL_STEPS: FlywheelStep[] = [
  {
    n: 1,
    title: "Single-channel outbound has a ceiling",
    copy: "Cold email alone books meetings, but pipeline plateaus once the list is burned. Stacking three channels removes the ceiling.",
  },
  {
    n: 2,
    title: "Match the ICP across channels",
    copy: "Content topics, ad targeting and outbound lists overlap: the same ICP, three coordinated touches.",
  },
  {
    n: 3,
    title: "Time outbound to content peaks",
    copy: "Send when prospects have just engaged with a post or visited the site. Recall is at its maximum.",
  },
  {
    n: 4,
    title: "Show ads before sending",
    copy: "Warm outbound lists with ads before the email lands. Familiarity beats a stranger in the inbox.",
  },
  {
    n: 5,
    title: "Measure pipeline, not channel metrics",
    copy: "Track sourced and influenced pipeline by ICP segment, not isolated channel KPIs.",
  },
];
