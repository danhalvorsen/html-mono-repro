import type { ISequencerPlaybackFrame } from "./ISequencerPlaybackFrame.js";

export interface ISequencerPlaybackFrameProvider {
  getPlaybackFrame(): ISequencerPlaybackFrame;
}