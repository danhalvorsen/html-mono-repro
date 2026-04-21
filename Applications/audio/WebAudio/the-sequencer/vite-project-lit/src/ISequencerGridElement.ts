import type { ISequencerGridTrackProjection, ISequencerGridTrackSelectionState, ISequencerGridColumnIndicatorProjection } from "../../modules/core-sequencer-ui/src/sequencerGrid";


export interface ISequencerGridElement extends HTMLElement {
    readonly stepCount: number;
    readonly trackCount: number;
    getTrackProjections(): readonly ISequencerGridTrackProjection[];
    setTrackSelectionStates(
        states: readonly ISequencerGridTrackSelectionState[]
    ): void;
    setColumnIndicatorProjection(
        projection: ISequencerGridColumnIndicatorProjection
    ): void;
}
