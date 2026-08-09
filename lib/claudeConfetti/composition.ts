/** Maps each composed frame index to character + particle layer state (legacy stomp export). */
export type ConfettiFrameComposition = {
  char: number;
  particle: number;
  side: "right" | "left";
};

export const FRAME_COMPOSITION: readonly ConfettiFrameComposition[] = [
  { char: 0, particle: 0, side: "right" },
  { char: 0, particle: 1, side: "right" },
  { char: 1, particle: 2, side: "right" },
  { char: 1, particle: 3, side: "right" },
  { char: 2, particle: 4, side: "right" },
  { char: 2, particle: 5, side: "right" },
  { char: 3, particle: 6, side: "right" },
  { char: 3, particle: 7, side: "right" },
  { char: 4, particle: 7, side: "right" },
  { char: 4, particle: 6, side: "right" },
  { char: 5, particle: 5, side: "right" },
  { char: 5, particle: 4, side: "right" },
  { char: 5, particle: 3, side: "right" },
  { char: 5, particle: 3, side: "left" },
  { char: 6, particle: 4, side: "left" },
  { char: 6, particle: 5, side: "left" },
  { char: 7, particle: 6, side: "left" },
  { char: 7, particle: 7, side: "left" },
  { char: 7, particle: 7, side: "left" },
  { char: 6, particle: 6, side: "left" },
  { char: 6, particle: 5, side: "left" },
  { char: 5, particle: 4, side: "left" },
  { char: 5, particle: 3, side: "left" },
  { char: 5, particle: 2, side: "left" },
  { char: 4, particle: 2, side: "right" },
  { char: 4, particle: 1, side: "right" },
  { char: 3, particle: 1, side: "right" },
  { char: 3, particle: 0, side: "right" },
  { char: 2, particle: 0, side: "right" },
  { char: 2, particle: 0, side: "right" },
  { char: 1, particle: 0, side: "right" },
  { char: 1, particle: 0, side: "right" },
  { char: 0, particle: 0, side: "right" },
  { char: 0, particle: 0, side: "right" },
  { char: 0, particle: 0, side: "right" },
  { char: 0, particle: 0, side: "right" },
];
