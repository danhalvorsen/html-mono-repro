import { MidiParseError } from "../errors/midi-parse-error.js";

export class MidiByteReader {
  public constructor(private readonly bytes: Uint8Array) {}

  public position = 0;

  public seek(position: number): void {
    if (position < 0 || position > this.bytes.length) {
      throw new MidiParseError("Invalid MIDI reader seek.");
    }

    this.position = position;
  }

  public skip(length: number): void {
    this.ensure(length);
    this.position += length;
  }

  public readAscii(length: number): string {
    const bytes = this.readBytes(length);
    return String.fromCharCode(...bytes);
  }

  public readUint16(): number {
    this.ensure(2);

    const value = (this.bytes[this.position]! << 8) | this.bytes[this.position + 1]!;
    this.position += 2;

    return value;
  }

  public readUint32(): number {
    this.ensure(4);

    const value =
      (this.bytes[this.position]! * 0x1000000) +
      ((this.bytes[this.position + 1]! << 16) |
        (this.bytes[this.position + 2]! << 8) |
        this.bytes[this.position + 3]!);

    this.position += 4;

    return value;
  }

  public readByteWithin(limit: number): number {
    if (this.position >= limit) {
      throw new MidiParseError("Unexpected end of MIDI track.");
    }

    return this.readByte();
  }

  public readBytesWithin(length: number, limit: number): readonly number[] {
    if (this.position + length > limit) {
      throw new MidiParseError("Unexpected end of MIDI track data.");
    }

    return this.readBytes(length);
  }

  public readVariableLengthQuantity(limit: number): number {
    let value = 0;

    for (let index = 0; index < 4; index++) {
      const byte = this.readByteWithin(limit);
      value = (value << 7) | (byte & 0x7f);

      if ((byte & 0x80) === 0) {
        return value;
      }
    }

    throw new MidiParseError("Invalid VLQ: exceeds four bytes.");
  }

  public slice(start: number, end: number): readonly number[] {
    return Array.from(this.bytes.slice(start, end));
  }

  private readByte(): number {
    this.ensure(1);

    const value = this.bytes[this.position]!;
    this.position += 1;

    return value;
  }

  private readBytes(length: number): readonly number[] {
    this.ensure(length);

    const value = Array.from(this.bytes.slice(this.position, this.position + length));
    this.position += length;

    return value;
  }

  private ensure(length: number): void {
    if (this.position + length > this.bytes.length) {
      throw new MidiParseError("Unexpected end of MIDI file.");
    }
  }
}
