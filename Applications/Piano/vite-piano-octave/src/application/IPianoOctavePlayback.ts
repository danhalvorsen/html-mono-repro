import type { AccordStep } from "../music/Accords";

export interface IPianoOctavePlayback {
  playAccords(progression: readonly AccordStep[], stepWaitMs: number, holdMs: number): void;
}
