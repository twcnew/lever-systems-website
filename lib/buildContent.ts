export type BuildMissionPhase = {
  phase: string;
  title: string;
  body: string;
  you: string;
  me: string;
};

export const BUILD_CONTENT = {
  label: "What I build",
  title: "One mission together.",
  titleAccent: "One system you own.",
  sub: "For about 90 days, we work side by side: map your motion, wire the first workflow, hand it to your team.",
  phases: [
    {
      phase: "Audit",
      title: "We map how selling works",
      body: "How your best deals are found, qualified, routed, and worked. What becomes a rule, what stays human.",
      you: "Walk me through the real motion",
      me: "Turn it into system logic",
    },
    {
      phase: "Build",
      title: "I wire the first workflow",
      body: "One use case, end to end: signal in, routed action out. Built inside Clay, CRM, Slack — your stack.",
      you: "Review on live accounts",
      me: "Build and iterate with you",
    },
    {
      phase: "Handover",
      title: "Your team runs it",
      body: "Documented, monitored, and shaped around how you already sell. The engine stays in your tools.",
      you: "Own and operate day to day",
      me: "Train, transfer, tune at launch",
    },
  ] satisfies BuildMissionPhase[],
  outcome: "At the end, you own the system. Or I keep operating the execution layer with you.",
};
