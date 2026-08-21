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

export type PyramidSideNote = {
  id: string;
  side: "left" | "right";
  eyebrow: string;
  title: string;
  copy: string;
};

export const PYRAMID_TITLE = "The GTM Pyramid";
export const PYRAMID_TITLE_ACCENT = "Pyramid";
export const PYRAMID_KICKER =
  "5 layers every predictable pipeline is built on";
export const PYRAMID_KICKER_ACCENT = "predictable pipeline";

export const PYRAMID_APEX = "Predictable pipeline";

export const PYRAMID_SIDE_NOTES: PyramidSideNote[] = [
  {
    id: "earn-scale",
    side: "left",
    eyebrow: "Start here",
    title: "Earn the right to scale",
    copy: "If the offer and customer language are weak, more reach only compounds noise.",
  },
  {
    id: "live-signals",
    side: "left",
    eyebrow: "Input",
    title: "Use live signals",
    copy: "Let a real hiring, funding or engagement signal make the first line specific.",
  },
  {
    id: "channels-reinforce",
    side: "right",
    eyebrow: "System",
    title: "Make channels reinforce",
    copy: "Content warms demand, ads remind and outbound converts it into a conversation.",
  },
  {
    id: "weekly-revenue",
    side: "right",
    eyebrow: "Loop",
    title: "Review revenue weekly",
    copy: "Follow the signal through pipeline and closed revenue, then update the next pass.",
  },
];

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
        desc: "One asset feeds content, retargeting, outbound proof and sales enablement. Repetition makes it compound.",
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
