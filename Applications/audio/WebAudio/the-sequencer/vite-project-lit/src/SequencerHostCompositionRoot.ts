import "../../modules/core-sequencer-ui/src/sequencerGrid.ts";
import {
  type ISequencerPlaybackProjectionSource,
  SequencerPlaybackProjectionMidiStreamProvider,
} from "../../modules/core-sequencer/src/index.ts";
import {
  SequencerPatternSelectionController as SequencerPatternSelectionApplicationController,
  SequencerTransportController,
} from "../../modules/core-sequencer-application/src/index.ts";
import { SequencerHostApplication } from "./SequencerHostApplication.ts";
import { MidiStreamDispatchPlaybackAdapter } from "./MidiStreamDispatchPlaybackAdapter.ts";
import type { ISequencerGridElement } from "./ISequencerGridElement.ts";

class GridSequencerPlaybackProjectionSource
  implements ISequencerPlaybackProjectionSource
{
  private readonly gridElement: ISequencerGridElement | null;

  public constructor(documentRef: Document) {
    this.gridElement = documentRef.querySelector(
      "sequencer-grid",
    ) as ISequencerGridElement | null;
  }

  public get stepCount(): number | undefined {
    return this.gridElement?.stepCount;
  }

  public getTrackProjections() {
    return this.gridElement?.getTrackProjections() ?? [];
  }
}

export class SequencerHostCompositionRoot {
  private readonly documentRef: Document;

  public constructor(documentRef: Document) {
    this.documentRef = documentRef;
  }

  public start(): void {
    const playbackProjectionSource = new GridSequencerPlaybackProjectionSource(
      this.documentRef,
    );
    const midiStreamProvider = new SequencerPlaybackProjectionMidiStreamProvider(
      playbackProjectionSource,
    );
    const gridElement = this.documentRef.querySelector(
      "sequencer-grid",
    ) as ISequencerGridElement | null;
    const trackCount = gridElement?.trackCount ?? 8;
    const trackIds = Array.from({ length: trackCount }, (_, index) => index);
    const patternSelectionController =
      new SequencerPatternSelectionApplicationController(trackIds);
    let applicationRef: SequencerHostApplication | null = null;
    const application = new SequencerHostApplication(
      this.documentRef,
      new SequencerTransportController({
        midiPlayback: new MidiStreamDispatchPlaybackAdapter({
          eventTarget: this.documentRef,
          streamProvider: midiStreamProvider,
          onStepChanged: (stepIndex) => {
            applicationRef?.updateCurrentStep(stepIndex);
          },
        }),
        midiStreamProvider,
      }),
      patternSelectionController,
      midiStreamProvider,
    );
    applicationRef = application;

    application.start();
  }
}
