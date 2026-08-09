export type ProductPhase = {
  number: string;
  title: string;
  period: string;
  body: string[];
  bullets?: string[];
};

export const PRODUCT_CONTENT = {
  chip: "AI-native GTM",
  label: "Product",
  heroTitle: ["Your GTM engine,", "built to compound."],
  heroSub:
    "The engine is the front door. I build it inside your own tools, ship your first working play in month one, then add one roughly every two weeks — until the whole system is yours to run.",
  ctaPrimary: "Book a Strategy Call",
  ctaSecondary: "See Use Cases",
  phases: [
    {
      number: "01",
      title: "Discovery & ICP mapping",
      period: "Days 1–30",
      body: [
        "I start by understanding your product, market, and buyer. Not a generic persona workshop — a deep audit of who actually buys, why, and what signals precede a deal. Then I clean your data and wire your first buying signals.",
        "By day 30 your first play goes live: a real buying moment puts a real action in your team's hands — a booked meeting inside your own tools, not a slide deck.",
      ],
      bullets: [
        "ICP definition with firmographic + behavioral filters",
        "Messaging framework for technical buyers",
        "Signal map: what to watch, where to find it",
      ],
    },
    {
      number: "02",
      title: "Signal engine & outbound live",
      period: "Days 31–60",
      body: [
        "A new play ships roughly every two weeks. The signal layer runs at full strength — 10 to 15 signals fire across the tools you already run, scored and routed to your CRM and Slack.",
        "By day 60, your first campaigns are live inside Clay, HubSpot, and your outbound tools. Reps get call-ready leads via Slack, not spreadsheets.",
      ],
      bullets: [
        "Clay workflows for enrichment & scoring",
        "Multi-channel sequences (email, LinkedIn)",
        "HubSpot + Slack integration for rep handoff",
      ],
    },
    {
      number: "03",
      title: "Pipeline optimization & scale",
      period: "Days 61–90",
      body: [
        "With live data flowing, I tune as real results come back: which signals convert, which sequences resonate, which ICP segments deliver the highest meeting rate.",
        "Day 90 is the handover: the whole engine, documented, inside your own tools. Yours to run with your team — or have me run it.",
      ],
      bullets: [
        "Reply rate & meeting rate optimization",
        "ICP segment refinement from live data",
        "Full documentation & handoff playbook",
      ],
    },
  ] satisfies ProductPhase[],
  cta: {
    eyebrow: "GET STARTED",
    title: ["Ready to move pipeline?", "Let's scope it on a call."],
    sub: "Every engagement starts with a strategy call. I'll map your ICP, audit your stack, and show you exactly what I'd build in 90 days — the build costs a fraction of one SDR hire, and you keep it.",
    button: "Book a Strategy Call",
  },
};
