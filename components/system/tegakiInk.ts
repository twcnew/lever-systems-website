export const TEGAKI_INK_COLOR = "color-mix(in srgb, var(--royal) 88%, var(--ink))";
export const TEGAKI_WRITE_DURATION_S = 1.4;
export const TEGAKI_TIMING = { glyphGap: 0.02, wordGap: 0.04 } as const;
export const TEGAKI_QUALITY = { smoothing: true, segmentSize: 1.5 } as const;

export const TEGAKI_CTA_STYLE = {
  /* the min(4.6vw) term only bites below ~370px so the longest single-line
     CTA keeps fitting on small phones; desktop sizing is unchanged */
  fontSize: "min(clamp(17px, 1.55vw, 20px), 4.6vw)",
  color: TEGAKI_INK_COLOR,
  fontWeight: 600,
  lineHeight: 1.25,
} as const;

export const TEGAKI_NOTE_STYLE = {
  fontSize: "clamp(14px, 1.35vw, 17px)",
  color: TEGAKI_INK_COLOR,
  fontWeight: 600,
  lineHeight: 1.2,
} as const;

export const TEGAKI_SIGNATURE_STYLE = {
  fontSize: "clamp(20px, 2.2vw, 26px)",
  color: TEGAKI_INK_COLOR,
  fontWeight: 600,
  lineHeight: 1.05,
} as const;

export const TEGAKI_SIGNATURE_FOOTER_STYLE = {
  ...TEGAKI_SIGNATURE_STYLE,
  fontSize: "clamp(26px, 2.8vw, 34px)",
} as const;

export const TEGAKI_INK_EFFECTS = {
  pressureWidth: { strength: 0.35 },
  taper: { startLength: 0.08, endLength: 0.12 },
} as const;
