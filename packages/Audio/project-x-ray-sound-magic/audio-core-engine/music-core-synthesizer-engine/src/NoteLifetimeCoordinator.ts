import type { INoteLifetimeCoordinator, IVoiceHandle, Normalized, Seconds } from "@monorepo/music-core-synthesizer-contracts";
import { NoteLifetimeCoordinatorDependencies } from "./contracts/NoteLifetimeCoordinatorDependencies.js";


export class NoteLifetimeCoordinator implements INoteLifetimeCoordinator {
  private readonly activeByNote = new Map<number, IVoiceHandle>();

  public constructor(private readonly dependencies: NoteLifetimeCoordinatorDependencies) { }

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
