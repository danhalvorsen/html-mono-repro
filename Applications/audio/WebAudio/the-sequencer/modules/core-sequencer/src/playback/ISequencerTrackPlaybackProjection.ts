export interface ISequencerTrackPlaybackProjection {
  readonly trackId: number;
  readonly selected: boolean;
  readonly stepStates: readonly boolean[];
}