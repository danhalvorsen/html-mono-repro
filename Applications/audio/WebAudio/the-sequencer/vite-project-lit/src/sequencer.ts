import "../../modules/core-sequencer-ui/src/sequencerGrid.ts";
import type {
  ISequencerGridTrackProjection,
} from "../../modules/core-sequencer-ui/src/sequencerGrid.ts";
import {
  SequencerPatternSelectionController,
  SequencerTransportController,
} from "../../modules/core-sequencer-application/src/index.ts";
import { SequencerHostApplication } from "./SequencerHostApplication.ts";
import { WebAudioMidiStreamPlaybackAdapter } from "./WebAudioMidiStreamPlaybackAdapter.ts";
import { SequencerPlayerFactory } from "./SequencerPlayerFactory.ts";
import type { ISequencerGridElement } from "./ISequencerGridElement.ts";
import type { IBpmControllableMidiStreamProvider } from "./IBpmControllableMidiStreamProvider.ts";
import type { ISequencerPlaybackFrame } from "./ISequencerPlaybackFrame.ts";
import type { ISequencerPlaybackFrameProvider } from "./ISequencerPlaybackFrameProvider.ts";
import type { IAudioContextGateway } from "./IAudioContextGateway.ts";

export class Delay {
  public static wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

class BrowserAudioContextGateway implements IAudioContextGateway {
  private readonly _context: AudioContext;

  public constructor(context?: AudioContext) {
    this._context = context ?? new AudioContext();
  }

  public get context(): AudioContext {
    return this._context;
  }

  public async resumeOnUserGesture(): Promise<void> {
    if (this._context.state !== "suspended") {
      return;
    }

    try {
      await this._context.resume();
    } catch {
      // Keep transport responsive even if browser policy blocks audio resume.
    }
  }
}

class GridMidiStreamProvider
  implements IBpmControllableMidiStreamProvider, ISequencerPlaybackFrameProvider
{
  private static readonly velocity = 112;
  private static readonly channel = 1;
  private static readonly beatsPerBar = 4;
  private static readonly defaultStepCount = 16;
  private static readonly notesByTrack = Object.freeze([36, 38, 42, 46, 49, 51, 45, 47]);
  private static readonly defaultBpm = 130;
  private readonly gridElement: ISequencerGridElement | null;
  private _bpm = GridMidiStreamProvider.defaultBpm;

  public constructor(documentRef: Document) {
    this.gridElement = documentRef.querySelector(
      "sequencer-grid",
    ) as ISequencerGridElement | null;
  }

  public buildStream(): string {
    const frame = this.getPlaybackFrame();
    const tokens: string[] = [];
    for (const step of frame.steps) {
      if (step.notes.length === 0) {
        tokens.push(`R-h${step.holdMs}`);
        continue;
      }

      for (const note of step.notes) {
        tokens.push(
          `N${note}-h${step.holdMs}-v${GridMidiStreamProvider.velocity}-ch${GridMidiStreamProvider.channel}`,
        );
      }
    }

    return tokens.join(" ");
  }

  public get bpm(): number {
    return this._bpm;
  }

  public setBpm(value: number): void {
    this._bpm = GridMidiStreamProvider.normalizeBpm(value);
  }

  public getPlaybackFrame(): ISequencerPlaybackFrame {
    const projections = this.gridElement?.getTrackProjections() ?? [];
    const stepCount = GridMidiStreamProvider.resolveStepCount(
      this.gridElement?.stepCount,
      projections,
    );
    const holdMs = this.resolveHoldMs(stepCount);

    const steps = Array.from({ length: stepCount }, (_, stepIndex) => {
      const notes = projections
        .filter(
          (track) => track.selected && track.stepStates[stepIndex] === true,
        )
        .map((track) => GridMidiStreamProvider.resolveNote(track.trackId));

      return Object.freeze({
        stepIndex,
        holdMs,
        notes,
      });
    });

    return Object.freeze({
      steps,
    });
  }

  private static resolveStepCount(
    gridStepCount: number | undefined,
    projections: readonly ISequencerGridTrackProjection[],
  ): number {
    if (typeof gridStepCount === "number" && Number.isFinite(gridStepCount)) {
      const normalized = Math.floor(gridStepCount);
      if (normalized > 0) {
        return normalized;
      }
    }

    const firstTrack = projections[0];
    if (firstTrack) {
      return firstTrack.stepStates.length;
    }

    return GridMidiStreamProvider.defaultStepCount;
  }

  private static resolveNote(trackId: number): number {
    const normalizedIndex = Math.abs(Math.floor(trackId));
    const resolved =
      GridMidiStreamProvider.notesByTrack[
        normalizedIndex % GridMidiStreamProvider.notesByTrack.length
      ];

    return resolved ?? 36;
  }

  private static normalizeBpm(value: number): number {
    if (!Number.isFinite(value)) {
      return GridMidiStreamProvider.defaultBpm;
    }

    const rounded = Math.floor(value);
    if (rounded === 100 || rounded === 130 || rounded === 160) {
      return rounded;
    }

    return GridMidiStreamProvider.defaultBpm;
  }

  private resolveHoldMs(stepCount: number): number {
    const beatMs = 60000 / this._bpm;
    const stepMs = (beatMs * GridMidiStreamProvider.beatsPerBar) / stepCount;
    return Math.max(30, Math.round(stepMs));
  }
}

const audioContextGateway = new BrowserAudioContextGateway();
const midiStreamProvider = new GridMidiStreamProvider(document);
const gridElement = document.querySelector(
  "sequencer-grid",
) as ISequencerGridElement | null;
const trackCount = gridElement?.trackCount ?? 8;
const trackIds = Array.from({ length: trackCount }, (_, index) => index);
const patternSelectionController = new SequencerPatternSelectionController(trackIds);
let applicationRef: SequencerHostApplication | null = null;
const application = new SequencerHostApplication(
  document,
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
