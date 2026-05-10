import { MidiParseError } from "../errors/midi-parse-error.js";
import { MidiChannelCommand } from "../types/midi-constants.js";

export class MidiMessageDataLength {
  public static channel(status: number): number {
    const command = status & 0xf0;

    switch (command) {
      case MidiChannelCommand.ProgramChange:
      case MidiChannelCommand.ChannelPressure:
        return 1;

      case MidiChannelCommand.NoteOff:
      case MidiChannelCommand.NoteOn:
      case MidiChannelCommand.PolyphonicKeyPressure:
      case MidiChannelCommand.ControlChange:
      case MidiChannelCommand.PitchBend:
        return 2;

      default:
        throw new MidiParseError(`Unsupported channel status byte 0x${status.toString(16)}.`);
    }
  }

  public static system(status: number): number {
    switch (status) {
      case 0xf1:
      case 0xf3:
        return 1;

      case 0xf2:
        return 2;

      case 0xf6:
      case 0xf8:
      case 0xf9:
      case 0xfa:
      case 0xfb:
      case 0xfc:
      case 0xfd:
      case 0xfe:
        return 0;

      default:
        throw new MidiParseError(`Unsupported system status byte 0x${status.toString(16)}.`);
    }
  }
}
