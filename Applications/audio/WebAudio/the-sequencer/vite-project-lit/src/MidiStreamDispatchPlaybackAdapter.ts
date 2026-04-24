import {
  MidiChannel,
  MidiNote,
  MidiStringParser,
  MidiVelocity,
  createNoteOn,
  type MidiMessage,
  type ParsedStep,
} from "@monorepo/music-core-midi";
import type {
  IMidiPlayer,
  MidiPlaybackOptions,
} from "@monorepo/music-core-midi-playback";
import type {
  IMidiStreamPlaybackPort,
  ISequencerMidiStreamProvider,
} from "../../modules/core-sequencer-application/src/index.ts";
import type {
  ISequencerPlaybackFrame,
  ISequencerPlaybackFrameProvider,
} from "../../modules/core-sequencer/src/index.ts";

interface IMidiStreamDispatchPlaybackAdapterDependencies {
  readonly player: IMidiPlayer;
  readonly streamProvider?: ISequencerMidiStreamProvider;
  readonly onStepChanged?: (stepIndex: number) => void;
}

export class MidiStreamDispatchPlaybackAdapter implements IMidiStreamPlaybackPort {
  private static readonly defaultVelocity = 112;
  private readonly parser = new MidiStringParser();
  private readonly player: IMidiPlayer;
  private readonly streamProvider?: ISequencerMidiStreamProvider;
  private readonly onStepChanged?: (stepIndex: number) => void;
  private readonly midiChannel: MidiChannel;
  private activeRunId = 0;
  private currentStream = "";

  public constructor(
    dependencies: IMidiStreamDispatchPlaybackAdapterDependencies,
  ) {
    this.player = dependencies.player;
    this.streamProvider = dependencies.streamProvider;
    this.onStepChanged = dependencies.onStepChanged;
    this.midiChannel = MidiChannel.create(1);
  }

  public async start(midiStream: string): Promise<void> {
    this.activeRunId += 1;
    const runId = this.activeRunId;
    this.currentStream = midiStream;

    void this.publishPlaybackSteps(runId);
  }

  public async stop(): Promise<void> {
    this.activeRunId += 1;
    this.onStepChanged?.(-1);
  }

  private async publishPlaybackSteps(runId: number): Promise<void> {
    while (this.activeRunId === runId) {
      const frame = this.tryGetPlaybackFrame();

      if (frame !== undefined) {
        if (frame.steps.length === 0) {
          await MidiStreamDispatchPlaybackAdapter.wait(50);
          continue;
        }

        for (const step of frame.steps) {
          if (this.activeRunId !== runId) {
            return;
          }

          this.onStepChanged?.(step.stepIndex);
          if (step.notes.length > 0) {
            for (const noteNumber of step.notes) {
              const noteMessage = this.tryCreateNoteMessage(noteNumber);
              if (noteMessage === undefined) {
                continue;
              }

              this.player.play(noteMessage, {
                noteLengthSeconds: Math.max(0.03, step.holdMs / 1000),
              });
            }
          }

          await MidiStreamDispatchPlaybackAdapter.wait(step.holdMs);
        }

        continue;
      }

      const latestStream = this.resolveLatestStream();
      const steps = this.parser.parse(latestStream);

      if (steps.length === 0) {
        await MidiStreamDispatchPlaybackAdapter.wait(50);
        continue;
      }

      for (const step of steps) {
        if (this.activeRunId !== runId) {
          return;
        }

        if (step.message !== null) {
          this.player.play(step.message, this.toPlaybackOptions(step));
        }

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

  private toPlaybackOptions(step: ParsedStep): MidiPlaybackOptions {
    return {
      noteLengthSeconds: Math.max(0.03, step.holdMs / 1000),
      ...(step.filterInfo1 !== undefined
        ? { filterFrequency: step.filterInfo1 }
        : {}),
      ...(step.filterInfo2 !== undefined ? { filterQ: step.filterInfo2 } : {}),
      ...(step.sustain !== undefined ? { sustain: step.sustain } : {}),
    };
  }

  private isPlaybackFrameProvider(
    provider: ISequencerMidiStreamProvider | undefined,
  ): provider is ISequencerMidiStreamProvider & ISequencerPlaybackFrameProvider {
    return provider !== undefined && "getPlaybackFrame" in provider;
  }

  private tryCreateNoteMessage(noteNumber: number): MidiMessage | undefined {
    if (!Number.isFinite(noteNumber)) {
      return undefined;
    }

    try {
      return createNoteOn(
        this.midiChannel,
        MidiNote.create(Math.floor(noteNumber)),
        MidiVelocity.create(MidiStreamDispatchPlaybackAdapter.defaultVelocity),
      );
    } catch {
      return undefined;
    }
  }

  private static wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
