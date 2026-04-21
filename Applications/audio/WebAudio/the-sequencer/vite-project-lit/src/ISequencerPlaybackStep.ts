export interface ISequencerPlaybackStep {
    readonly stepIndex: number;
    readonly holdMs: number;
    readonly notes: readonly number[];
}
