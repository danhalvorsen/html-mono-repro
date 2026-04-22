import { type ISequencerTransportController, type ISequencerPatternSelectionController, SequencerTransportState } from "../../modules/core-sequencer-application/src";
import type { IBpmControllableMidiStreamProvider } from "../../modules/core-sequencer/src/index.ts";
import { SequencerControlEvents } from "../../modules/core-sequencer-ui/src/sequencerControl.ts";
import { SequencerUiEvents, type ISequencerBpmRequestedDetail as ISequencerControlBpmRequestedDetail, type ISequencerFeatureToggleRequestedDetail as ISequencerControlColumnIndicatorToggleRequestedDetail, type ISequencerTrackSelectionToggleRequestedDetail as ISequencerTrackPatternSelectionToggleRequestedDetail, type ISequencerTransportRequestedDetail as ISequencerControlTransportRequestedDetail } from "../../modules/core-sequencer-ui/src/ui-contract.ts";
import type { ISequencerGridElement } from "./ISequencerGridElement";
import type { ISequencerControlElement } from "./ISequencerControlElement";

export class SequencerHostApplication {
    private readonly controlElement: ISequencerControlElement | null;
    private readonly gridElement: ISequencerGridElement | null;
    private readonly transportController: ISequencerTransportController;
    private readonly patternSelectionController: ISequencerPatternSelectionController;
    private readonly midiStreamProvider: IBpmControllableMidiStreamProvider;
    private transportPlaying = false;
    private columnIndicatorEnabled = false;
    private currentIndicatorColumn = -1;

    public constructor(
        documentRef: Document,
        transportController: ISequencerTransportController,
        patternSelectionController: ISequencerPatternSelectionController,
        midiStreamProvider: IBpmControllableMidiStreamProvider
    ) {
        this.controlElement = documentRef.querySelector(
            "sequencer-control"
        ) as ISequencerControlElement | null;
        this.gridElement = documentRef.querySelector(
            "sequencer-grid"
        ) as ISequencerGridElement | null;
        this.transportController = transportController;
        this.patternSelectionController = patternSelectionController;
        this.midiStreamProvider = midiStreamProvider;
    }

    public start(): void {
        this.transportController.subscribe((projection) => {
            this.renderTransportState(projection.state);
        });
        this.patternSelectionController.subscribe((projection) => {
            this.gridElement?.setTrackSelectionStates(projection.tracks);
        });
        this.applyColumnIndicatorProjection();

        if (this.controlElement) {
            const control = this.controlElement;
            control.bpm = this.midiStreamProvider.bpm;
            control.columnIndicatorEnabled = this.columnIndicatorEnabled;

            control.addEventListener(
                SequencerControlEvents.transportRequested,
                async (event) => {
                    const customEvent = event as CustomEvent<ISequencerControlTransportRequestedDetail>;

                    if (customEvent.detail.id === "play") {
                        control.playing = true;
                        await this.transportController.requestPlay();
                        return;
                    }

                    if (customEvent.detail.id === "stop") {
                        control.playing = false;
                        await this.transportController.requestStop();
                    }
                }
            );

            control.addEventListener(
                SequencerControlEvents.bpmRequested,
                (event) => {
                    const customEvent = event as CustomEvent<ISequencerControlBpmRequestedDetail>;
                    this.midiStreamProvider.setBpm(customEvent.detail.bpm);
                    control.bpm = this.midiStreamProvider.bpm;
                }
            );

            control.addEventListener(
                SequencerControlEvents.columnIndicatorToggleRequested,
                (event) => {
                    const customEvent = event as CustomEvent<ISequencerControlColumnIndicatorToggleRequestedDetail>;
                    this.columnIndicatorEnabled = customEvent.detail.enabled;
                    control.columnIndicatorEnabled = this.columnIndicatorEnabled;

                    if (!this.columnIndicatorEnabled) {
                        this.currentIndicatorColumn = -1;
                    }

                    this.applyColumnIndicatorProjection();
                }
            );
        }

        this.gridElement?.addEventListener(
            SequencerUiEvents.trackSelectionToggleRequested,
            async (event) => {
                const customEvent = event as CustomEvent<ISequencerTrackPatternSelectionToggleRequestedDetail>;

                await this.patternSelectionController.toggleTrack(
                    customEvent.detail.trackId
                );
            }
        );
    }

    private renderTransportState(state: SequencerTransportState): void {
        const isPlaying = state === SequencerTransportState.Playing;
        this.transportPlaying = isPlaying;

        if (!isPlaying) {
            this.currentIndicatorColumn = -1;
        }

        if (this.controlElement) {
            this.controlElement.playing = isPlaying;
        }

        this.applyColumnIndicatorProjection();
    }

    public updateCurrentStep(stepIndex: number): void {
        this.currentIndicatorColumn = stepIndex;
        this.applyColumnIndicatorProjection();
    }

    private applyColumnIndicatorProjection(): void {
        this.gridElement?.setColumnIndicatorProjection({
            enabled: this.columnIndicatorEnabled,
            playing: this.transportPlaying && this.columnIndicatorEnabled,
            currentColumn: this.transportPlaying && this.columnIndicatorEnabled
                ? this.currentIndicatorColumn
                : -1,
        });
    }
}
