import {
  MidiMessageKinds,
  type IMidiSongCatalogJsonParser,
  type MidiMessage,
  type MidiSong,
  type MidiTimedMessage,
} from "@monorepo/audio-function-midi-streamer-contracts";

export class JsonMidiSongCatalogParser implements IMidiSongCatalogJsonParser {
  public parse(value: unknown): readonly MidiSong[] {
    const songsValue = this.readSongsRoot(value);

    return songsValue.map((songValue, index) => this.readSong(songValue, index));
  }

  private readSongsRoot(value: unknown): readonly unknown[] {
    if (Array.isArray(value)) {
      return value;
    }

    if (this.isRecord(value) && Array.isArray(value["songs"])) {
      return value["songs"];
    }

    throw new TypeError("Expected a MIDI song array or an object with a songs array.");
  }

  private readSong(value: unknown, index: number): MidiSong {
    const path = `songs[${index}]`;
    const record = this.requireRecord(value, path);

    return {
      id: this.readString(record, "id", `${path}.id`),
      title: this.readString(record, "title", `${path}.title`),
      tempoBpm: this.readNumber(record, "tempoBpm", `${path}.tempoBpm`),
      ticksPerQuarterNote: this.readNumber(
        record,
        "ticksPerQuarterNote",
        `${path}.ticksPerQuarterNote`,
      ),
      events: this.readEvents(record["events"], `${path}.events`),
    };
  }

  private readEvents(value: unknown, path: string): readonly MidiTimedMessage[] {
    if (!Array.isArray(value)) {
      throw new TypeError(`${path} must be an array.`);
    }

    return value.map((eventValue, index) => {
      const eventPath = `${path}[${index}]`;
      const eventRecord = this.requireRecord(eventValue, eventPath);

      return {
        tick: this.readNumber(eventRecord, "tick", `${eventPath}.tick`),
        message: this.readMessage(eventRecord["message"], `${eventPath}.message`),
      };
    });
  }

  private readMessage(value: unknown, path: string): MidiMessage {
    const record = this.requireRecord(value, path);
    const kind = this.readString(record, "kind", `${path}.kind`);

    switch (kind) {
      case MidiMessageKinds.noteOn:
        return {
          kind: MidiMessageKinds.noteOn,
          channel: this.readNumber(record, "channel", `${path}.channel`),
          note: this.readNumber(record, "note", `${path}.note`),
          velocity: this.readNumber(record, "velocity", `${path}.velocity`),
        };

      case MidiMessageKinds.noteOff:
        return {
          kind: MidiMessageKinds.noteOff,
          channel: this.readNumber(record, "channel", `${path}.channel`),
          note: this.readNumber(record, "note", `${path}.note`),
          velocity: this.readNumber(record, "velocity", `${path}.velocity`),
        };

      case MidiMessageKinds.controlChange:
        return {
          kind: MidiMessageKinds.controlChange,
          channel: this.readNumber(record, "channel", `${path}.channel`),
          controller: this.readNumber(record, "controller", `${path}.controller`),
          value: this.readNumber(record, "value", `${path}.value`),
        };

      case MidiMessageKinds.pitchBend:
        return {
          kind: MidiMessageKinds.pitchBend,
          channel: this.readNumber(record, "channel", `${path}.channel`),
          value: this.readNumber(record, "value", `${path}.value`),
        };

      case MidiMessageKinds.systemExclusive:
        return {
          kind: MidiMessageKinds.systemExclusive,
          data: this.readNumberArray(record["data"], `${path}.data`),
        };

      default:
        throw new TypeError(`${path}.kind is not a supported MIDI message kind.`);
    }
  }

  private readNumberArray(value: unknown, path: string): readonly number[] {
    if (!Array.isArray(value)) {
      throw new TypeError(`${path} must be a number array.`);
    }

    return value.map((item, index) => {
      if (typeof item !== "number" || !Number.isFinite(item)) {
        throw new TypeError(`${path}[${index}] must be a finite number.`);
      }

      return item;
    });
  }

  private readString(
    record: Readonly<Record<string, unknown>>,
    key: string,
    path: string,
  ): string {
    const value = record[key];

    if (typeof value !== "string" || value.trim().length === 0) {
      throw new TypeError(`${path} must be a non-empty string.`);
    }

    return value;
  }

  private readNumber(
    record: Readonly<Record<string, unknown>>,
    key: string,
    path: string,
  ): number {
    const value = record[key];

    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError(`${path} must be a finite number.`);
    }

    return value;
  }

  private requireRecord(
    value: unknown,
    path: string,
  ): Readonly<Record<string, unknown>> {
    if (!this.isRecord(value)) {
      throw new TypeError(`${path} must be an object.`);
    }

    return value;
  }

  private isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
