import type { ISequencerTrackPlaybackProjection } from "./ISequencerTrackPlaybackProjection.js";

export interface ISequencerPlaybackProjectionSource {
  readonly stepCount: number | undefined;
  getTrackProjections(): readonly ISequencerTrackPlaybackProjection[];
}