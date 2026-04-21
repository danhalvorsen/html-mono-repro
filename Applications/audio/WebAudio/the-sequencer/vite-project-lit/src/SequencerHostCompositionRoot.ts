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
import { WebAudioMidiStreamPlaybackAdapter } from "./WebAudioMidiStreamPlaybackAdapter.ts";
import { SequencerPlayerFactory } from "./SequencerPlayerFactory.ts";
import type { ISequencerGridElement } from "./ISequencerGridElement.ts";
import type { IAudioContextGateway } from "./IAudioContextGateway.ts";

class BrowserAudioContextGateway implements IAudioContextGateway {
  private readonly contextValue: AudioContext;

  public constructor(context?: AudioContext) {
    this.contextValue = context ?? new AudioContext();
  }

  public get context(): AudioContext {
    return this.contextValue;
  }

  public async resumeOnUserGesture(): Promise<void> {
    if (this.contextValue.state !== "suspended") {
      return;
    }

    try {
      await this.contextValue.resume();
    } catch {
      // Keep transport responsive even if browser policy blocks audio resume.
    }
  }
}

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
    const audioContextGateway = new BrowserAudioContextGateway();
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
        midiPlayback: new WebAudioMidiStreamPlaybackAdapter(
          SequencerPlayerFactory.createDefault(audioContextGateway.context),
          {
            streamProvider: midiStreamProvider,
            onStepChanged: (stepIndex) => {
              applicationRef?.updateCurrentStep(stepIndex);
            },
          },
        ),
        midiStreamProvider,
      }),
      patternSelectionController,
      midiStreamProvider,
      audioContextGateway,
    );
    applicationRef = application;

    application.start();
  }
}