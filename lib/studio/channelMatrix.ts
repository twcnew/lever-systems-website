export type ChannelMatrixChannelId = "email" | "linkedin" | "calling";

export type ChannelMatrixCell = {
  lead?: string;
  lines?: string[];
  chips?: string[];
};

export type ChannelMatrixRow = {
  factor: string;
  cells: Record<ChannelMatrixChannelId, ChannelMatrixCell>;
};

export const CHANNEL_MATRIX_TITLE =
  "Cold Email vs LinkedIn DMs vs Cold Calling";
export const CHANNEL_MATRIX_TITLE_ACCENT = "Cold Email";
export const CHANNEL_MATRIX_KICKER =
  "Which channel is best for each account tier?";
export const CHANNEL_MATRIX_KICKER_ACCENT = "account tier";

export const CHANNEL_MATRIX_CHANNELS = [
  { id: "email", label: "Cold email" },
  { id: "linkedin", label: "LinkedIn DMs" },
  { id: "calling", label: "Cold calling" },
] as const;

export const CHANNEL_MATRIX_ROWS: ChannelMatrixRow[] = [
  {
    factor: "Daily volume",
    cells: {
      email: {
        lines: ["500–2,000+ emails", "Limited mainly by infrastructure."],
      },
      linkedin: {
        lines: ["~40 DMs", "~25 connection requests", "Hard platform caps."],
      },
      calling: {
        lines: ["50–100 dials", "Time is the bottleneck."],
      },
    },
  },
  {
    factor: "TAM",
    cells: {
      email: {
        lead: "Broad.",
        lines: ["Thousands of contacts.", "Built for scale plays."],
      },
      linkedin: {
        lead: "Narrow.",
        lines: ["Hundreds of contacts.", "Precise targeting only."],
      },
      calling: {
        lead: "Medium.",
        lines: ["Constrained by time.", "Focus on highest-value accounts."],
      },
    },
  },
  {
    factor: "Approach",
    cells: {
      email: {
        lines: ["Direct pitch works.", "Test 5–10 angles.", "Use a clear next step."],
      },
      linkedin: {
        lines: ["Value first — no hard ask.", "Build the connection.", "Everyone is pitching. Do not."],
      },
      calling: {
        lines: ["Adaptive and real-time.", "Handle objections live.", "Conversation-driven."],
      },
    },
  },
  {
    factor: "Data",
    cells: {
      email: { chips: ["Firmographic", "Intent", "Enrichment"] },
      linkedin: { chips: ["Social graph", "Mutuals"] },
      calling: { chips: ["Direct dials", "Org chart"] },
    },
  },
  {
    factor: "Tools",
    cells: {
      email: { chips: ["Sequencer", "Deliverability", "CRM"] },
      linkedin: { chips: ["Sales Nav", "Workflows", "CRM"] },
      calling: { chips: ["Dialer", "CRM"] },
    },
  },
  {
    factor: "Scalability",
    cells: {
      email: {
        lead: "High.",
        lines: ["Add inboxes and domains.", "Infrastructure is the limit."],
      },
      linkedin: {
        lead: "Low.",
        lines: ["Platform caps bottleneck", "the whole operation."],
      },
      calling: {
        lead: "Medium.",
        lines: ["Parallel dialers help,", "but time still limits you."],
      },
    },
  },
  {
    factor: "Best account tier",
    cells: {
      email: {
        lead: "Tier 2–3.",
        lines: ["Scale play.", "Market and approach testing."],
      },
      linkedin: {
        lead: "Tier 1.",
        lines: ["High-value accounts", "you cannot afford to burn."],
      },
      calling: {
        lead: "Tier 1.",
        lines: ["Break through silence.", "Late-stage nudge."],
      },
    },
  },
  {
    factor: "Best use cases",
    cells: {
      email: {
        lead: "Broad TAM coverage.",
        lines: ["Test message–market fit.", "Generate pipeline fast."],
      },
      linkedin: {
        lead: "High-value accounts.",
        lines: ["Multi-channel sequences.", "Relationship nurturing."],
      },
      calling: {
        lead: "Tier 1 account closers.",
        lines: ["Real-time qualification.", "Break through silence."],
      },
    },
  },
  {
    factor: "Main challenge",
    cells: {
      email: {
        lines: ["Deliverability + standing out", "in crowded inboxes."],
      },
      linkedin: {
        lines: ["Platform caps bottleneck ops.", "Everyone pitches — you cannot."],
      },
      calling: {
        lead: "Time-heavy.",
        lines: ["Low connect rates.", "Hard to scale without dialers."],
      },
    },
  },
  {
    factor: "Relationship building",
    cells: {
      email: { lead: "Low.", lines: ["Transactional by default."] },
      linkedin: { lead: "High.", lines: ["Best for nurture plays."] },
      calling: {
        lead: "Medium–High.",
        lines: ["Real connection when it lands."],
      },
    },
  },
];

export const CHANNEL_MATRIX_CTA =
  "Match the channel to the account. Then stack the three.";
export const CHANNEL_MATRIX_CTA_ACCENT = "stack the three.";
