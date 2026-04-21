import type { ISequencerPlaybackStep } from "./ISequencerPlaybackStep";

export interface ISequencerPlaybackFrame {
    readonly steps: readonly ISequencerPlaybackStep[];
}
