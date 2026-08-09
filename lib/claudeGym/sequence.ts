/**
 * Gym Claude playback — timing from Codrops / Ayotomiwa Wale-Durojaye.
 * @see https://tympanus.net/codrops/2026/05/05/reverse-engineering-claude-ais-mascot-animations-with-svg-and-gsap/
 */

/** 48 beats over 36 illustrated frames (frames 13–24 replay for the second rep). */
export const FRAME_SEQUENCE = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
  13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
] as const;

export function getDelay(seqIdx: number, frame: number): number {
  if (seqIdx === FRAME_SEQUENCE.length - 1) return 1.5;
  if (frame === 6 || frame === 7) return 0.27;
  if (frame === 15 || frame === 21) return 0.4;
  return 0.085;
}
