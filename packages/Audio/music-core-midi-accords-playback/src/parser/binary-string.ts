import { MidiParseError } from "../errors/midi-parse-error.js";

export class MidiBinaryString {
  public static toBytes(value: string): Uint8Array {
    const bytes = new Uint8Array(value.length);

    for (let index = 0; index < value.length; index++) {
      const code = value.charCodeAt(index);

      if (code < 0 || code > 0xff) {
        throw new MidiParseError(
          "Song returned a non-binary string. Each character code must be in range 0..255.",
        );
      }

      bytes[index] = code;
    }

    return bytes;
  }
}
