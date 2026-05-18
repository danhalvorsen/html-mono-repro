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

interface IRuntimeSequencerSoundEngine extends IMidiPlayer {
  getCurrentTimeSeconds(): number;
  allNotesOff(channel?: number): void;
  allSoundOff(channel?: number): void;
  panic(): void;
}

interface IMidiStreamDispatchPlaybackAdapterDependencies {
  readonly player: IMidiPlayer;
  readonly streamProvider?: ISequencerMidiStreamProvider;
  readonly onStepChanged?: (stepIndex: number) => void;
}

export class MidiStreamDispatchPlaybackAdapter implements IMidiStreamPlaybackPort {
  private static readonly defaultVelocity = 112;
  private static readonly lookAheadSeconds = 0.015;
  private static readonly percussiveNoteLengthSeconds = 0.028;
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
    if (this.isSequencerSoundEngine(this.player)) {
      this.player.allNotesOff();
      this.player.allSoundOff();
      this.player.panic();
    }
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
          if (step.noteEvents.length > 0) {
            for (const noteEvent of step.noteEvents) {
              const noteMessage = this.tryCreateNoteMessage(noteEvent.note);
              if (noteMessage === undefined) {
                continue;
              }

              const playbackOptions = {
                noteLengthSeconds: Math.min(
                  noteEvent.voice.noteLengthSeconds ??
                    MidiStreamDispatchPlaybackAdapter.percussiveNoteLengthSeconds,
                  Math.max(0.01, step.holdMs / 1000),
                ),
                sustain: noteEvent.voice.sustain ?? 0,
                ...(noteEvent.voice.filterFrequency !== undefined
                  ? { filterFrequency: noteEvent.voice.filterFrequency }
                  : {}),
                ...(noteEvent.voice.filterQ !== undefined
                  ? { filterQ: noteEvent.voice.filterQ }
                  : {}),
                ...this.getScheduledStartOptions(),
              } as MidiPlaybackOptions;
              this.player.play(noteMessage, playbackOptions);
            }
          } else if (step.notes.length > 0) {
            for (const noteNumber of step.notes) {
              const noteMessage = this.tryCreateNoteMessage(noteNumber);
              if (noteMessage === undefined) {
                continue;
              }

              const playbackOptions = {
                noteLengthSeconds: Math.min(
                  MidiStreamDispatchPlaybackAdapter.percussiveNoteLengthSeconds,
                  Math.max(0.01, step.holdMs / 1000),
                ),
                sustain: 0,
                ...this.getScheduledStartOptions(),
              } as MidiPlaybackOptions;
              this.player.play(noteMessage, playbackOptions);
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
          const playbackOptions = {
            ...this.toPlaybackOptions(step),
            ...this.getScheduledStartOptions(),
          } as MidiPlaybackOptions;
          this.player.play(step.message, playbackOptions);
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

  private getScheduledStartOptions(): Record<string, number> | Record<string, never> {
    if (!this.isSequencerSoundEngine(this.player)) {
      return {};
    }

    return {
      startAtSeconds:
        this.player.getCurrentTimeSeconds() +
        MidiStreamDispatchPlaybackAdapter.lookAheadSeconds,
    };
  }

  private isPlaybackFrameProvider(
    provider: ISequencerMidiStreamProvider | undefined,
  ): provider is ISequencerMidiStreamProvider & ISequencerPlaybackFrameProvider {
    return provider !== undefined && "getPlaybackFrame" in provider;
  }

  private isSequencerSoundEngine(player: IMidiPlayer): player is IRuntimeSequencerSoundEngine {
    const candidate = player as Partial<IRuntimeSequencerSoundEngine>;
    return (
      typeof candidate.getCurrentTimeSeconds === "function" &&
      typeof candidate.allNotesOff === "function" &&
      typeof candidate.allSoundOff === "function" &&
      typeof candidate.panic === "function"
    );
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
