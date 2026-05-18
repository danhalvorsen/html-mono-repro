import { MidiParseError } from "../errors/midi-parse-error.js";
import type { MidiFileHeader } from "@monorepo/music-core-midi/accords-types";
import { DefaultTempoMicrosecondsPerQuarterNote } from "@monorepo/music-core-midi/accords-types";
import type { ParsedTrackEvent, ParsedMetaEvent, TempoPoint } from "../utils/internal-types.js";

export class TempoMap {
  private constructor(
    private readonly header: MidiFileHeader,
    private readonly points: readonly TempoPoint[],
  ) {}

  public static create(header: MidiFileHeader, events: readonly ParsedTrackEvent[]): TempoMap {
    const points = events
      .filter((event): event is ParsedMetaEvent => event.type === "meta" && event.metaType === 0x51)
      .map((event): TempoPoint => {
        if (event.data.length !== 3) {
          throw new MidiParseError("Invalid Set Tempo meta event: expected exactly 3 bytes.");
        }

        return {
          tick: event.absoluteTick,
          tempoMicrosecondsPerQuarterNote:
            (event.data[0]! << 16) |
            (event.data[1]! << 8) |
            event.data[2]!,
          sequence: event.sequence,
        };
      })
      .sort((a, b) => a.tick - b.tick || a.sequence - b.sequence);

    return new TempoMap(header, Object.freeze(points));
  }

  public timestampMsAtTick(tick: number): number {
    if (this.header.division.kind === "smpte") {
      const ticksPerSecond =
        this.header.division.framesPerSecond * this.header.division.ticksPerFrame;

      return (tick / ticksPerSecond) * 1000;
    }

    const ticksPerQuarterNote = this.header.division.ticksPerQuarterNote;

    let currentTick = 0;
    let currentTempo = DefaultTempoMicrosecondsPerQuarterNote;
    let microseconds = 0;

    for (const point of this.points) {
      if (point.tick > tick) {
        break;
      }

      microseconds +=
        ((point.tick - currentTick) * currentTempo) / ticksPerQuarterNote;

      currentTick = point.tick;
      currentTempo = point.tempoMicrosecondsPerQuarterNote;
    }

    microseconds +=
      ((tick - currentTick) * currentTempo) / ticksPerQuarterNote;

    return microseconds / 1000;
  }
}
