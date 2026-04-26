import { MidiMessage, MidiStatus } from "@monorepo/music-core-midi";
import type { IMidiMessageRouter, Normalized } from "@monorepo/music-core-synthesizer-contracts";
import { MidiMessageRouterDependencies } from "./contracts/MidiMessageRouterDependencies.js";

export class MidiMessageRouter implements IMidiMessageRouter {
  public constructor(private readonly dependencies: MidiMessageRouterDependencies) { }

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
