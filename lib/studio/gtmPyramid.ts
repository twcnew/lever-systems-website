export type PyramidItem = {
  title: string;
  desc: string;
};

export type PyramidLayer = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  label: string;
  subtitle: string;
  items: PyramidItem[];
};

export type PyramidRule = {
  rule: string;
  sub: string;
};

export const PYRAMID_TITLE = "The GTM Pyramid";
export const PYRAMID_TITLE_ACCENT = "Pyramid";
export const PYRAMID_KICKER =
  "5 layers every predictable pipeline is built on";
export const PYRAMID_KICKER_ACCENT = "predictable pipeline";

export const PYRAMID_APEX = "Predictable pipeline";

export const PYRAMID_CTA = "If pipeline feels random, start at layer 1.";
export const PYRAMID_CTA_ACCENT = "start at layer 1.";

export const PYRAMID_LAYERS: PyramidLayer[] = [
  {
    id: "foundation",
    level: 1,
    label: "Foundation",
    subtitle: "The 2 layers most founders skip.",
    items: [
      {
        title: "Quote your ICP",
        desc: "Repeat their pain in their own words. If you can't, your messaging is guessing.",
      },
      {
        title: "Sharpen the offer",
        desc: "Channels amplify what already exists. Scaling a weak offer just produces more rejection, faster.",
      },
      {
        title: "Pick your enemy",
        desc: "Name the alternative you're explicitly against. 'We try harder' gives buyers nothing to remember you by.",
      },
      {
        title: "Stack signals + triggers",
        desc: "Stack 3 per outreach: funding + GTM hire + content engagement.",
      },
      {
        title: "Protect the inbox",
        desc: "SPF, DKIM, DMARC, domain warm-up, send caps. Without these, copy never gets read.",
      },
    ],
  },
  {
    id: "trigger-copy",
    level: 2,
    label: "Trigger-driven copy",
    subtitle: "Make the event write the first line.",
    items: [
      {
        title: "Let triggers write the copy",
        desc: "Company hires a GTM engineer. 'Help them ramp in 30 days' is the email. The event personalizes.",
      },
      {
        title: "Run three channels",
        desc: "Content warms. Ads remind. Outbound converts. One alone breeds dependency. 3 together reinforce each other.",
      },
      {
        title: "Niche of one",
        desc: "'B2B SaaS founders' is too broad to land. 'Series A AI SaaS without SDRs' gets forwarded.",
      },
      {
        title: "Publish a thesis",
        desc: "Pick the strongest opinion your data defends. Repeat it across every post. The audience self-selects in.",
      },
    ],
  },
  {
    id: "compound-content",
    level: 3,
    label: "Compound the content",
    subtitle: "Inbound is a year of daily reps, not one viral post.",
    items: [
      {
        title: "Compound the content",
        desc: "~100 inbound meetings/month, $0 ads. A year of daily reps built that. One viral post never could.",
      },
      {
        title: "Retarget your readers",
        desc: "Spending ad budget on strangers wastes the audience your content earned. Retarget engaged accounts with proof.",
      },
      {
        title: "Run micro campaigns",
        desc: "Top senders run small targeted campaigns, highest replies. Bottom blast and starve. Same tool, opposite outcomes.",
      },
    ],
  },
  {
    id: "sequence",
    level: 4,
    label: "Sequence + measure",
    subtitle: "Most revenue dies between meeting 1 and meeting 2.",
    items: [
      {
        title: "Sequence everything",
        desc: "Every opener, click, no-show: 5-touch follow-up. Most revenue dies between meeting 1 and meeting 2.",
      },
      {
        title: "Report revenue, not meetings",
        desc: "Meetings booked is vanity. Pipeline created and revenue closed is what clients actually pay for.",
      },
    ],
  },
  {
    id: "close-loop",
    level: 5,
    label: "Close the loop",
    subtitle: "Where the playbook stays alive — or dies.",
    items: [
      {
        title: "Close the loop",
        desc: "Each week, audit which signal converted and which channel paid. Without that loop, the playbook dies.",
      },
    ],
  },
];

export const PYRAMID_LEFT: PyramidRule[] = [
  { rule: "Signal over volume", sub: "relevance beats reach, every time" },
  { rule: "Warm over cold", sub: "they raised their hand first" },
  { rule: "Proof over opinion", sub: "show the work, not the talk" },
  { rule: "Distribution over product", sub: "the audience wins in the AI era" },
];

export const PYRAMID_RIGHT: PyramidRule[] = [
  { rule: "Systems, not tactics", sub: "tactics peak, systems compound" },
  { rule: "Compound, don't campaign", sub: "one asset, many users, many months" },
  { rule: "Revenue, not meetings", sub: "every other metric inflates" },
  { rule: "Their words, not yours", sub: "use customer verbatim, not your deck" },
];
