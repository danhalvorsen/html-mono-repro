import type { ISequencerMidiStreamProvider } from "../../modules/core-sequencer-application/src";
import type { ISequencerPlaybackFrame } from "./ISequencerPlaybackFrame";


export interface ISequencerPlaybackFrameProvider extends ISequencerMidiStreamProvider {
    getPlaybackFrame(): ISequencerPlaybackFrame;
}
