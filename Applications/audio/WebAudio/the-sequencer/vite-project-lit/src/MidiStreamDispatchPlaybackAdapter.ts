import type { IMidiStreamPlaybackPort, ISequencerMidiStreamProvider } from "../../modules/core-sequencer-application/src/index.ts";
import type { ISequencerPlaybackFrame, ISequencerPlaybackFrameProvider } from "../../modules/core-sequencer/src/index.ts";

const SequencerMidiStreamEvent = Object.freeze({
  Started: "sequencer-midi-stream-started",
  Stopped: "sequencer-midi-stream-stopped",
} as const);

interface IStreamStartedDetail {
  readonly midiStream: string;
}

interface IStreamStoppedDetail {
  readonly reason: "stop-requested";
}

interface IMidiStreamDispatchPlaybackAdapterDependencies {
  readonly eventTarget: EventTarget;
  readonly streamProvider?: ISequencerMidiStreamProvider;
  readonly onStepChanged?: (stepIndex: number) => void;
}

export class MidiStreamDispatchPlaybackAdapter implements IMidiStreamPlaybackPort {
  private readonly eventTarget: EventTarget;
  private readonly streamProvider?: ISequencerMidiStreamProvider;
  private readonly onStepChanged?: (stepIndex: number) => void;
  private activeRunId = 0;
  private currentStream = "";

  public constructor(
    dependencies: IMidiStreamDispatchPlaybackAdapterDependencies,
  ) {
    this.eventTarget = dependencies.eventTarget;
    this.streamProvider = dependencies.streamProvider;
    this.onStepChanged = dependencies.onStepChanged;
  }

  public async start(midiStream: string): Promise<void> {
    this.activeRunId += 1;
    const runId = this.activeRunId;
    this.currentStream = midiStream;

    this.dispatchStarted(this.resolveLatestStream());
    void this.publishPlaybackSteps(runId);
  }

  public async stop(): Promise<void> {
    this.activeRunId += 1;
    this.onStepChanged?.(-1);
    this.dispatchStopped();
  }

  private async publishPlaybackSteps(runId: number): Promise<void> {
    while (this.activeRunId === runId) {
      const frame = this.tryGetPlaybackFrame();

      if (frame === undefined || frame.steps.length === 0) {
        await MidiStreamDispatchPlaybackAdapter.wait(50);
        continue;
      }

      this.dispatchStarted(this.resolveLatestStream());

      for (const step of frame.steps) {
        if (this.activeRunId !== runId) {
          return;
        }

        this.onStepChanged?.(step.stepIndex);
        await MidiStreamDispatchPlaybackAdapter.wait(step.holdMs);
      }
    }
  }

  private tryGetPlaybackFrame(): ISequencerPlaybackFrame | undefined {
    if (!this.isPlaybackFrameProvider(this.streamProvider)) {
      return undefined;
    }

    return this.streamProvider.getPlaybackFrame();
  }

  private resolveLatestStream(): string {
    const nextStream = this.streamProvider?.buildStream() ?? this.currentStream;
    this.currentStream = nextStream;
    return nextStream;
  }

  private dispatchStarted(midiStream: string): void {
    this.eventTarget.dispatchEvent(
      new CustomEvent<IStreamStartedDetail>(SequencerMidiStreamEvent.Started, {
        detail: { midiStream },
      }),
    );
  }

  private dispatchStopped(): void {
    this.eventTarget.dispatchEvent(
      new CustomEvent<IStreamStoppedDetail>(SequencerMidiStreamEvent.Stopped, {
        detail: { reason: "stop-requested" },
      }),
    );
  }

  private isPlaybackFrameProvider(
    provider: ISequencerMidiStreamProvider | undefined,
  ): provider is ISequencerMidiStreamProvider & ISequencerPlaybackFrameProvider {
    return provider !== undefined && "getPlaybackFrame" in provider;
  }

  private static wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
