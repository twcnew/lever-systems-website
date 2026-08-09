export type PlayStep = {
  tag: string;
  text: string;
  badge?: string;
};

const MIN_INNER = 26;

/**
 * Vertical play-flow diagram:
 *
 * ┌─ SIGNAL ─────────────────┐
 * │ Series A raised          │
 * └────────────┬─────────────┘
 *              ▼
 * ┌─ ENRICH ─────────────────┐
 * ...
 */
export function playFlow(steps: PlayStep[]): string {
  const contentWidth = Math.max(
    MIN_INNER,
    ...steps.map((s) => {
      const badgeLen = s.badge ? s.badge.length + 3 : 0;
      return Math.max(s.text.length + badgeLen, s.tag.length + 4);
    }),
  );
  const iw = contentWidth + 2;
  const half = Math.floor(iw / 2);

  const lines: string[] = [];
  steps.forEach((step, index) => {
    const isLast = index === steps.length - 1;
    lines.push(`┌─ ${step.tag} ${"─".repeat(iw - step.tag.length - 3)}┐`);

    let content = step.text;
    if (step.badge) {
      const gap = iw - 2 - step.text.length - step.badge.length - 2;
      content = `${step.text}${" ".repeat(Math.max(gap, 1))}[${step.badge}]`;
    }
    lines.push(`│ ${content.padEnd(iw - 2, " ")} │`);

    if (isLast) {
      lines.push(`└${"─".repeat(iw)}┘`);
    } else {
      lines.push(`└${"─".repeat(half)}┬${"─".repeat(iw - half - 1)}┘`);
      lines.push(`${" ".repeat(half + 1)}▼`);
    }
  });

  return lines.join("\n");
}

/** Titled blueprint: header rule + play-flow. */
export function blueprint(title: string, steps: PlayStep[]): string {
  const flow = playFlow(steps);
  const width = flow.indexOf("\n");
  const header = `PLAY · ${title.toUpperCase()}`;
  return [header, "─".repeat(Math.max(width, header.length)), flow].join("\n");
}

/** The full-system map shown when submitting free text. */
export const STACK_MAP = [
  "      ┌─────────┐       ┌─────────┐",
  "      │   CRM   │◄─────►│  CLAY   │",
  "      └────┬────┘       └────┬────┘",
  "           │                 │",
  "           ▼                 ▼",
  "     ┌─────────────────────────────┐",
  "     │        SIGNAL ENGINE        │",
  "     │    enrich · score · route   │",
  "     └──────────────┬──────────────┘",
  "                    │",
  "         ┌──────────┼──────────┐",
  "         ▼          ▼          ▼",
  "     ┌───────┐  ┌───────┐  ┌───────┐",
  "     │ EMAIL │  │ SLACK │  │ CALLS │",
  "     └───────┘  └───────┘  └───────┘",
].join("\n");

export type SignalRow = {
  time: string;
  signal: string;
  account: string;
};

/** Ticker-style feed of live signals. */
export function signalFeed(rows: SignalRow[]): string {
  const sigWidth = Math.max(...rows.map((r) => r.signal.length));
  const accWidth = Math.max(...rows.map((r) => r.account.length));
  return rows
    .map(
      (r) =>
        `░ ${r.time}  ${r.signal.padEnd(sigWidth)}  ${r.account.padEnd(accWidth)}  → routed`,
    )
    .join("\n");
}
