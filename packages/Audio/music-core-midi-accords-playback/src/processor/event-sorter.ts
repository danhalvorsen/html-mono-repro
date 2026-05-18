import { MidiChannelCommand } from "@monorepo/music-core-midi/accords-types";
import type { MidiLogicalEvent } from "@monorepo/music-core-midi/accords-types";
import type { ParsedTrackEvent } from "../utils/internal-types.js";

export class StableEventSorter {
  public static sortParsed(events: readonly ParsedTrackEvent[]): readonly ParsedTrackEvent[] {
    return [...events].sort(
      (a, b) =>
        a.absoluteTick - b.absoluteTick ||
        this.parsedPriority(a) - this.parsedPriority(b) ||
        a.trackIndex - b.trackIndex ||
        a.sequence - b.sequence,
    );
  }

  public static sortLogical(events: readonly MidiLogicalEvent[]): readonly MidiLogicalEvent[] {
    return [...events].sort(
      (a, b) =>
        a.absoluteTick - b.absoluteTick ||
        this.logicalPriority(a) - this.logicalPriority(b) ||
        a.trackIndex - b.trackIndex ||
        a.sequence - b.sequence,
    );
  }

  private static parsedPriority(event: ParsedTrackEvent): number {
    if (event.type === "meta") {
      return 0;
    }

    if (event.type === "sysex") {
      return 1;
    }

    if (event.type === "channel") {
      if (event.command === MidiChannelCommand.NoteOff) {
        return 2;
      }

      if (event.command === MidiChannelCommand.NoteOn && (event.data[1] ?? 0) === 0) {
        return 2;
      }

      if (event.command === MidiChannelCommand.NoteOn) {
        return 3;
      }

      return 4;
    }

    return 5;
  }

  private static logicalPriority(event: MidiLogicalEvent): number {
    switch (event.kind) {
      case "meta":
        return 0;
      case "sysex":
        return 1;
      case "note-off":
        return 2;
      case "note-on":
        return 3;
      case "channel":
        return 4;
      case "system":
        return 5;
      default:
        return 6;
    }
  }
}
