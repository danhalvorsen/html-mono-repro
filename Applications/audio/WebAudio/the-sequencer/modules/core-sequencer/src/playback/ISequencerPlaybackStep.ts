export interface ISequencerVoiceParameters {
  readonly noteLengthSeconds?: number;
  readonly sustain?: number;
  readonly filterFrequency?: number;
  readonly filterQ?: number;
}

export interface ISequencerPlaybackNoteEvent {
  readonly trackId: number;
  readonly note: number;
  readonly voice: ISequencerVoiceParameters;
}

export interface ISequencerPlaybackStep {
  readonly stepIndex: number;
  readonly holdMs: number;
  readonly notes: readonly number[];
  readonly noteEvents: readonly ISequencerPlaybackNoteEvent[];
}
