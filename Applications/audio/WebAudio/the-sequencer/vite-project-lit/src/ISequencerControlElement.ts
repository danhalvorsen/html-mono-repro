import type { SequencerControlEvents } from "../../modules/core-sequencer-ui/src/sequencerControl";


export interface ISequencerControlElement extends HTMLElement {
    playing: boolean;
    bpm: number;
    columnIndicatorEnabled: boolean;
    addEventListener(
        type: typeof SequencerControlEvents.transportRequested,
        listener: (event: Event) => void | Promise<void>
    ): void;
    addEventListener(
        type: typeof SequencerControlEvents.bpmRequested,
        listener: (event: Event) => void | Promise<void>
    ): void;
    addEventListener(
        type: typeof SequencerControlEvents.columnIndicatorToggleRequested,
        listener: (event: Event) => void | Promise<void>
    ): void;
}
