// packages/Audio/music-core-synthesizer-engine/src/index.ts

import {
  MidiStatus,
  type MidiMessage,
} from "@monorepo/music-core-midi";

import type {
  Hertz,
  IMidiMessageRouter,
  IMidiNoteFrequencyMapper,
  INoteLifetimeCoordinator,
  ISynthEngine,
  IVoiceDefinition,
  Normalized,
  Seconds,
} from "@monorepo/music-core-synthesizer-contracts";

/* ============================================================================
   Time
============================================================================ */

export interface IAudioTimeProvider {
  now(): Seconds;
}

/* ============================================================================
   Frequency
============================================================================ */

export class EqualTemperamentMidiNoteFrequencyMapper implements IMidiNoteFrequencyMapper {
  public map(note: number): Hertz {
    if (!Number.isInteger(note) || note < 0 || note > 127) {
      throw new Error("MIDI note must be an integer in range 0..127.");
    }

    return 440 * Math.pow(2, (note - 69) / 12);
  }
}

/* ============================================================================
   Engine
============================================================================ */

export interface SynthEngineDependencies {
  readonly router: IMidiMessageRouter;
  readonly coordinator: INoteLifetimeCoordinator;
}

export class SynthEngine implements ISynthEngine {
  public constructor(
    private readonly dependencies: SynthEngineDependencies,
    private voiceDefinition: IVoiceDefinition,
  ) {}

  public handle(message: MidiMessage): void {
    this.dependencies.router.route(message);
  }

  public setVoiceDefinition(definition: IVoiceDefinition): void {
    this.voiceDefinition = definition;
  }

  public getVoiceDefinition(): IVoiceDefinition {
    return this.voiceDefinition;
  }

  public panic(): void {
    this.dependencies.coordinator.releaseAll(0);
  }

  public dispose(): void {
    this.panic();
  }
}

/* ============================================================================
   MIDI routing
============================================================================ */

export interface MidiMessageRouterDependencies {
  readonly timeProvider: IAudioTimeProvider;
  readonly coordinator: INoteLifetimeCoordinator;
}

export class MidiMessageRouter implements IMidiMessageRouter {
  public constructor(private readonly dependencies: MidiMessageRouterDependencies) {}

  public route(message: MidiMessage): void {
    const at = this.dependencies.timeProvider.now();

    switch (message.status) {
      case MidiStatus.NoteOn: {
        const velocity = this.toNormalized(message.velocity.value());

        if (velocity <= 0) {
          this.dependencies.coordinator.noteOff(message.note.value(), at);
          return;
        }

        this.dependencies.coordinator.noteOn(message.note.value(), velocity, at);
        return;
      }

      case MidiStatus.NoteOff:
        this.dependencies.coordinator.noteOff(message.note.value(), at);
        return;

      default:
        return;
    }
  }

  private toNormalized(value0To127: number): Normalized {
    if (!Number.isInteger(value0To127) || value0To127 < 0 || value0To127 > 127) {
      throw new Error("MIDI velocity must be an integer in range 0..127.");
    }

    return value0To127 / 127;
  }
}

/* ============================================================================
   Note lifetime
============================================================================ */

import type {
  IVoiceHandle,
} from "@monorepo/music-core-synthesizer-contracts";

export interface NoteLifetimeCoordinatorDependencies {
  readonly voiceFactory: IVoiceFactoryLike;
  readonly frequencyMapper: IMidiNoteFrequencyMapper;
  readonly voiceDefinitionProvider: IVoiceDefinitionProvider;
}

export interface IVoiceFactoryLike {
  create(request: {
    readonly note: number;
    readonly velocity: Normalized;
    readonly frequencyHz: Hertz;
    readonly definition: IVoiceDefinition;
    readonly startedAt: Seconds;
  }): IVoiceHandle;
}

export interface IVoiceDefinitionProvider {
  get(): IVoiceDefinition;
}

export class StaticVoiceDefinitionProvider implements IVoiceDefinitionProvider {
  public constructor(private definition: IVoiceDefinition) {}

  public get(): IVoiceDefinition {
    return this.definition;
  }

  public set(definition: IVoiceDefinition): void {
    this.definition = definition;
  }
}

export class NoteLifetimeCoordinator implements INoteLifetimeCoordinator {
  private readonly activeByNote = new Map<number, IVoiceHandle>();

  public constructor(private readonly dependencies: NoteLifetimeCoordinatorDependencies) {}

  public noteOn(note: number, velocity: Normalized, at: Seconds): void {
    this.releaseExisting(note, at);

    const voice = this.dependencies.voiceFactory.create({
      note,
      velocity,
      frequencyHz: this.dependencies.frequencyMapper.map(note),
      definition: this.dependencies.voiceDefinitionProvider.get(),
      startedAt: at,
    });

    voice.start(at);
    this.activeByNote.set(note, voice);
  }

  public noteOff(note: number, at: Seconds): void {
    const voice = this.activeByNote.get(note);

    if (!voice) {
      return;
    }

    voice.release(at);
    this.activeByNote.delete(note);
  }

  public releaseAll(at: Seconds): void {
    for (const voice of this.activeByNote.values()) {
      voice.release(at);
    }

    this.activeByNote.clear();
  }

  private releaseExisting(note: number, at: Seconds): void {
    const existing = this.activeByNote.get(note);

    if (!existing) {
      return;
    }

    existing.release(at);
    this.activeByNote.delete(note);
  }
}