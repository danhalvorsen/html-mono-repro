import type { ISequencerPlaybackStep } from "./ISequencerPlaybackStep.js";

export interface ISequencerPlaybackFrame {
  readonly steps: readonly ISequencerPlaybackStep[];
}