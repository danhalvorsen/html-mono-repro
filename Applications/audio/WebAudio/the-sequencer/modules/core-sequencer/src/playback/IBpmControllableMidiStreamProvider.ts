import type { ISequencerPlaybackFrameProvider } from "./ISequencerPlaybackFrameProvider.js";

export interface IBpmControllableMidiStreamProvider
  extends ISequencerPlaybackFrameProvider
{
  readonly bpm: number;
  setBpm(value: number): void;
  buildStream(): string;
}