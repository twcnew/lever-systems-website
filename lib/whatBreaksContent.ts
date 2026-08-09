export type ProblemSceneId = "manual-lists" | "signals-unused" | "pipeline-chaos";

export type ProblemPillar = {
  id: string;
  headline: string;
  detail: string;
  sceneId: ProblemSceneId;
};

/** Three thematic pillars — regroups the former five system-cost pains. */
export const PROBLEM_PILLARS: ProblemPillar[] = [
  {
    id: "manual-ops",
    headline: "Manual, repetitive, slow work.",
    detail:
      "Reps spend the week maintaining the process instead of advancing pipeline, so growth stays capped by manual effort.",
    sceneId: "manual-lists",
  },
  {
    id: "signals-unused",
    headline: "Signals never used.",
    detail:
      "Buying signals aren't tracked, nobody routes them to the right rep. Intent sits in the stack while reps work off lists and memory.",
    sceneId: "signals-unused",
  },
  {
    id: "pipeline-chaos",
    headline: "Unpredictable pipeline.",
    detail:
      "You cannot forecast hiring, board commits, or capacity because the motion has no operating rhythm, only rep-by-rep heroics.",
    sceneId: "pipeline-chaos",
  },
];

export const RISK_TICKER = {
  prefix: "COST OF NOT FIXING THIS",
  lines: [
    "Lead shows up with no context. Sales burns the call.",
    "SDR books the meeting. AE opens the CRM with one line, no story.",
    "Routing changes. Nobody tells Sales. Two reps, same account.",
    "You change the ICP. The list still doesn\u2019t.",
    "Champion\u2019s gone. Deal\u2019s still qualified. Forecast\u2019s wrong.",
    "Marketing changes what counts as a lead. Sales finds out from the inbox.",
    "Handoff was in chat. CRM is blank. AE starts cold.",
    "Everyone brings a different forecast. The board commits blind.",
    "Playbook updated. Reps never got the memo.",
  ],
};

export const WHAT_BREAKS_CONTENT = {
  label: "The Problem",
  title: "You know your product and your market.",
  titleAccent: "But your pipeline still isn't a system.",
  sub: "Your strategy works. Your sales team knows how to sell. But the motion stays manual, so reps spend the week on low-value work instead of closing.",
  cta: {
    label: "Stop the manual motion — book a strategy call →",
    href: "#contact",
  },
};
