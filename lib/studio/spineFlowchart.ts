export type SpineTool = {
  id: string;
  label: string;
  src?: string;
};

export type SpineCard = {
  id: string;
  action: string;
  tools: SpineTool[];
  dead?: boolean;
  feedback?: boolean;
};

export type SpineNode = {
  id: string;
  label: string;
};

export type SpineTier = {
  id: string;
  label: string;
  note: string;
};

export type SpineTopology = "fan-in" | "tiers" | "hitl" | "fan-out";

export type SpineZone = {
  id: "capture" | "score" | "hitl" | "route";
  label: string;
  emphasis: "ink" | "royal";
  topology: SpineTopology;
  tools: SpineTool[];
  cards: SpineCard[];
  nodes: SpineNode[];
  inputs?: SpineNode[];
  tiers?: SpineTier[];
  fallback?: SpineNode;
};

export type SpineAnchorSide = "top" | "right" | "bottom" | "left";
export type SpineWireRole = "main" | "branch" | "fallback" | "feedback" | "dead";
export type SpineWireRoute = "vertical" | "fan" | "lateral" | "feedback";

export type SpineWire = {
  id: string;
  from: string;
  to: string;
  fromSide: SpineAnchorSide;
  toSide: SpineAnchorSide;
  role: SpineWireRole;
  route: SpineWireRoute;
  group?: string;
};

export const SPINE_TITLE_ACCENT = "always-on pipeline";

export const SPINE_FLOWCHART = {
  title: "Turn market signal into always-on pipeline",
  titleAccent: SPINE_TITLE_ACCENT,
  kicker: "Four steps to increase your revenue",
  kickerAccent: "increase your revenue",
  zones: [
    {
      id: "capture",
      label: "1 Capture Signal",
      emphasis: "ink",
      topology: "fan-in",
      tools: [{ id: "clay", label: "Clay", src: "/gtm/clay.png" }],
      inputs: [
        { id: "first", label: "First-party" },
        { id: "second", label: "Second-party" },
        { id: "third", label: "Third-party" },
      ],
      cards: [
        {
          id: "clay-core",
          action: "Capture, orchestrate, enrich.",
          tools: [{ id: "clay", label: "Clay", src: "/gtm/clay.png" }],
        },
      ],
      nodes: [
        {
          id: "roi",
          label: "Existing paid tools first. New tools must earn their ROI.",
        },
      ],
    },
    {
      id: "score",
      label: "2 Score",
      emphasis: "ink",
      topology: "tiers",
      tools: [],
      nodes: [
        { id: "criteria", label: "ICP criteria validated by the team" },
      ],
      cards: [
        {
          id: "tier",
          action: "Score + tier accounts.",
          tools: [],
        },
      ],
      tiers: [
        { id: "t1", label: "Tier 1", note: "Deep research + multi-channel" },
        { id: "t2", label: "Tier 2", note: "Targeted personalization + multi-channel" },
        { id: "t3", label: "Tier 3", note: "Templated outreach + single channel" },
      ],
    },
    {
      id: "hitl",
      label: "3 HITL (human in the loop)",
      emphasis: "royal",
      topology: "hitl",
      tools: [{ id: "slack", label: "Slack", src: "/gtm/slack.png" }],
      nodes: [{ id: "owner", label: "One owner per account" }],
      fallback: {
        id: "rr",
        label: "No owner? Round-robin to an AE",
      },
      cards: [
        { id: "approve", action: "Approve", tools: [] },
        {
          id: "rewrite",
          action: "Rewrite with feedback",
          tools: [],
          feedback: true,
        },
        { id: "reject", action: "Reject", tools: [], dead: true },
      ],
    },
    {
      id: "route",
      label: "4 Route",
      emphasis: "ink",
      topology: "fan-out",
      tools: [],
      nodes: [{ id: "after", label: "After approval" }],
      cards: [
        {
          id: "hubspot",
          action: "Sync",
          tools: [{ id: "hubspot", label: "HubSpot", src: "/gtm/hubspot.png" }],
        },
        {
          id: "slack-route",
          action: "Notify",
          tools: [{ id: "slack", label: "Slack", src: "/gtm/slack.png" }],
        },
        {
          id: "lemlist",
          action: "Send",
          tools: [{ id: "lemlist", label: "Lemlist", src: "/gtm/lemlist.png" }],
        },
      ],
    },
  ] satisfies SpineZone[],
  footer: {
    byline: "Alexis Rodrigues",
    tag: "lever.systems",
  },
} as const;

export const SPINE_WIRES: readonly SpineWire[] = [
  {
    id: "capture-first-core",
    from: "capture-first",
    to: "capture-core",
    fromSide: "bottom",
    toSide: "top",
    role: "branch",
    route: "fan",
    group: "capture-fan",
  },
  {
    id: "capture-second-core",
    from: "capture-second",
    to: "capture-core",
    fromSide: "bottom",
    toSide: "top",
    role: "branch",
    route: "fan",
    group: "capture-fan",
  },
  {
    id: "capture-third-core",
    from: "capture-third",
    to: "capture-core",
    fromSide: "bottom",
    toSide: "top",
    role: "branch",
    route: "fan",
    group: "capture-fan",
  },
  {
    id: "capture-core-rule",
    from: "capture-core",
    to: "capture-rule",
    fromSide: "bottom",
    toSide: "top",
    role: "main",
    route: "vertical",
  },
  {
    id: "capture-score",
    from: "capture-rule",
    to: "score-criteria",
    fromSide: "bottom",
    toSide: "top",
    role: "main",
    route: "vertical",
  },
  {
    id: "score-criteria-core",
    from: "score-criteria",
    to: "score-core",
    fromSide: "bottom",
    toSide: "top",
    role: "main",
    route: "vertical",
  },
  {
    id: "score-core-tier-1",
    from: "score-core",
    to: "score-tier-1",
    fromSide: "bottom",
    toSide: "top",
    role: "branch",
    route: "fan",
    group: "score-fan",
  },
  {
    id: "score-core-tier-2",
    from: "score-core",
    to: "score-tier-2",
    fromSide: "bottom",
    toSide: "top",
    role: "branch",
    route: "fan",
    group: "score-fan",
  },
  {
    id: "score-core-tier-3",
    from: "score-core",
    to: "score-tier-3",
    fromSide: "bottom",
    toSide: "top",
    role: "branch",
    route: "fan",
    group: "score-fan",
  },
  {
    id: "score-tier-1-hitl",
    from: "score-tier-1",
    to: "zone-hitl",
    fromSide: "bottom",
    toSide: "top",
    role: "branch",
    route: "fan",
    group: "score-exit",
  },
  {
    id: "score-tier-2-hitl",
    from: "score-tier-2",
    to: "zone-hitl",
    fromSide: "bottom",
    toSide: "top",
    role: "main",
    route: "fan",
    group: "score-exit",
  },
  {
    id: "score-tier-3-hitl",
    from: "score-tier-3",
    to: "zone-hitl",
    fromSide: "bottom",
    toSide: "top",
    role: "branch",
    route: "fan",
    group: "score-exit",
  },
  {
    id: "hitl-round-robin-owner",
    from: "hitl-round-robin",
    to: "hitl-owner",
    fromSide: "left",
    toSide: "right",
    role: "fallback",
    route: "lateral",
  },
  {
    id: "hitl-owner-approve",
    from: "hitl-owner",
    to: "hitl-approve",
    fromSide: "bottom",
    toSide: "top",
    role: "main",
    route: "fan",
    group: "hitl-fan",
  },
  {
    id: "hitl-owner-rewrite",
    from: "hitl-owner",
    to: "hitl-rewrite",
    fromSide: "bottom",
    toSide: "top",
    role: "branch",
    route: "fan",
    group: "hitl-fan",
  },
  {
    id: "hitl-owner-reject",
    from: "hitl-owner",
    to: "hitl-reject",
    fromSide: "bottom",
    toSide: "top",
    role: "dead",
    route: "fan",
    group: "hitl-fan",
  },
  {
    id: "hitl-approve-route",
    from: "hitl-approve",
    to: "route-after",
    fromSide: "bottom",
    toSide: "top",
    role: "main",
    route: "vertical",
  },
  {
    id: "route-after-sync",
    from: "route-after",
    to: "route-hubspot",
    fromSide: "bottom",
    toSide: "top",
    role: "branch",
    route: "fan",
    group: "route-fan",
  },
  {
    id: "route-after-notify",
    from: "route-after",
    to: "route-slack-route",
    fromSide: "bottom",
    toSide: "top",
    role: "branch",
    route: "fan",
    group: "route-fan",
  },
  {
    id: "route-after-send",
    from: "route-after",
    to: "route-lemlist",
    fromSide: "bottom",
    toSide: "top",
    role: "branch",
    route: "fan",
    group: "route-fan",
  },
] as const;
