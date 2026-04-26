import type { Seconds } from "@monorepo/music-core-synthesizer-contracts";

/* ============================================================================
   Time
============================================================================ */

export interface IAudioTimeProvider {
  now(): Seconds;
}
