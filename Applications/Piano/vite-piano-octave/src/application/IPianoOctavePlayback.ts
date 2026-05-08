import type { AccordStep } from "../music/Accords";

export interface IPianoOctavePlayback {
  playDemoChords(): void;
  playAccords(
    progression: readonly AccordStep[],
    stepWaitMs: number,
    holdMs: number
  ): void;
}

