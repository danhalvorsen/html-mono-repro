import type { ISequencerMidiStreamProvider } from "../../modules/core-sequencer-application/src";


export interface IBpmControllableMidiStreamProvider extends ISequencerMidiStreamProvider {
    readonly bpm: number;
    setBpm(value: number): void;
}
