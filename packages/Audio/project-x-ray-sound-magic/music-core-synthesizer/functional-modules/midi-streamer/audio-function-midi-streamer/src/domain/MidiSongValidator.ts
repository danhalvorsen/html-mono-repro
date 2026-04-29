import {
  MidiMessageKinds,
  type MidiMessage,
  type MidiSong,
} from "@monorepo/audio-function-midi-streamer-contracts";
import { MidiSongValidationError } from "./MidiSongValidationError.js";

export class MidiSongValidator {
  public validate(song: MidiSong): void {
    this.requireNonEmptyText(song.id, "song.id");
    this.requireNonEmptyText(song.title, "song.title");
    this.requirePositiveNumber(song.tempoBpm, "song.tempoBpm");
    this.requirePositiveInteger(song.ticksPerQuarterNote, "song.ticksPerQuarterNote");

    if (song.events.length === 0) {
      throw new MidiSongValidationError("song.events must contain at least one MIDI event.");
    }

    for (const [index, event] of song.events.entries()) {
      this.requireNonNegativeInteger(event.tick, `song.events[${index}].tick`);
      this.validateMessage(event.message, `song.events[${index}].message`);
    }
  }

  private validateMessage(message: MidiMessage, path: string): void {
    switch (message.kind) {
      case MidiMessageKinds.noteOn:
        this.requireMidiChannel(message.channel, `${path}.channel`);
        this.requireMidiByte(message.note, `${path}.note`);
        this.requireMidiByte(message.velocity, `${path}.velocity`);
        return;

      case MidiMessageKinds.noteOff:
        this.requireMidiChannel(message.channel, `${path}.channel`);
        this.requireMidiByte(message.note, `${path}.note`);
        this.requireMidiByte(message.velocity, `${path}.velocity`);
        return;

      case MidiMessageKinds.controlChange:
        this.requireMidiChannel(message.channel, `${path}.channel`);
        this.requireMidiByte(message.controller, `${path}.controller`);
        this.requireMidiByte(message.value, `${path}.value`);
        return;

      case MidiMessageKinds.pitchBend:
        this.requireMidiChannel(message.channel, `${path}.channel`);
        this.requireIntegerRange(message.value, -8192, 8191, `${path}.value`);
        return;

      case MidiMessageKinds.systemExclusive:
        for (const [index, value] of message.data.entries()) {
          this.requireMidiByte(value, `${path}.data[${index}]`);
        }
        return;
    }
  }

  private requireNonEmptyText(value: string, path: string): void {
    if (value.trim().length === 0) {
      throw new MidiSongValidationError(`${path} must be non-empty.`);
    }
  }

  private requirePositiveNumber(value: number, path: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new MidiSongValidationError(`${path} must be a positive number.`);
    }
  }

  private requirePositiveInteger(value: number, path: string): void {
    if (!Number.isInteger(value) || value <= 0) {
      throw new MidiSongValidationError(`${path} must be a positive integer.`);
    }
  }

  private requireNonNegativeInteger(value: number, path: string): void {
    if (!Number.isInteger(value) || value < 0) {
      throw new MidiSongValidationError(`${path} must be a non-negative integer.`);
    }
  }

  private requireMidiChannel(value: number, path: string): void {
    this.requireIntegerRange(value, 0, 15, path);
  }

  private requireMidiByte(value: number, path: string): void {
    this.requireIntegerRange(value, 0, 127, path);
  }

  private requireIntegerRange(
    value: number,
    minimum: number,
    maximum: number,
    path: string,
  ): void {
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
      throw new MidiSongValidationError(
        `${path} must be an integer in range ${minimum}..${maximum}.`,
      );
    }
  }
}
