/* ===================== core-midi (using ISpecification) ===================== */

import {
  Specification,
  type ISpecification,
} from "@monorepo/core-specifications";

/* ---------- SPECIFICATIONS ---------- */

class ChannelInRange extends Specification<number> {
  public isSatisfiedBy(v: number): boolean {
    return v >= 1 && v <= 16;
  }
}

class NoteInRange extends Specification<number> {
  public isSatisfiedBy(v: number): boolean {
    return v >= 0 && v <= 127;
  }
}

class VelocityInRange extends Specification<number> {
  public isSatisfiedBy(v: number): boolean {
    return v >= 0 && v <= 127;
  }
}

/* ---------- VALUE OBJECTS ---------- */

export const enum MidiStatus {
  NoteOff = 0x80,
  NoteOn  = 0x90,
}

export class MidiChannel {
  private static readonly spec: ISpecification<number> = new ChannelInRange();
  private constructor(private readonly v: number) {}

  public static create(ch1to16: number): MidiChannel {
    if (!this.spec.isSatisfiedBy(ch1to16)) throw new Error("Channel 1..16");
    return new MidiChannel(ch1to16 - 1);
  }

  public value(): number { return this.v; }
}

export class MidiNote {
  private static readonly spec: ISpecification<number> = new NoteInRange();
  private constructor(private readonly v: number) {}

  public static create(note0to127: number): MidiNote {
    if (!this.spec.isSatisfiedBy(note0to127)) throw new Error("Note 0..127");
    return new MidiNote(note0to127);
  }

  public value(): number { return this.v; }
}

export class MidiVelocity {
  private static readonly spec: ISpecification<number> = new VelocityInRange();
  private constructor(private readonly v: number) {}

  public static create(v0to127: number): MidiVelocity {
    if (!this.spec.isSatisfiedBy(v0to127)) throw new Error("Velocity 0..127");
    return new MidiVelocity(v0to127);
  }

  public static readonly Default = new MidiVelocity(100);
  public static readonly Zero = new MidiVelocity(0);

  public value(): number { return this.v; }
}

/* ---------- DOMAIN MESSAGE ---------- */

export type MidiMessage =
  | {
      readonly status: MidiStatus.NoteOn;
      readonly channel: MidiChannel;
      readonly note: MidiNote;
      readonly velocity: MidiVelocity;
    }
  | {
      readonly status: MidiStatus.NoteOff;
      readonly channel: MidiChannel;
      readonly note: MidiNote;
      readonly velocity: MidiVelocity;
    };

export function createNoteOn(
  channel: MidiChannel,
  note: MidiNote,
  velocity: MidiVelocity = MidiVelocity.Default,
): MidiMessage {
  return {
    status: MidiStatus.NoteOn,
    channel,
    note,
    velocity,
  };
}

export function createNoteOff(
  channel: MidiChannel,
  note: MidiNote,
  velocity: MidiVelocity = MidiVelocity.Zero,
): MidiMessage {
  return {
    status: MidiStatus.NoteOff,
    channel,
    note,
    velocity,
  };
}

export const NoteSymbol = {
  C: "C",
  BSharp: "B#",
  CSharp: "C#",
  DFlat: "Db",
  D: "D",
  DSharp: "D#",
  EFlat: "Eb",
  E: "E",
  FFlat: "Fb",
  ESharp: "E#",
  F: "F",
  FSharp: "F#",
  GFlat: "Gb",
  G: "G",
  GSharp: "G#",
  AFlat: "Ab",
  A: "A",
  ASharp: "A#",
  BFlat: "Bb",
  B: "B",
  CFlat: "Cb",
} as const;

export type NoteSymbol = (typeof NoteSymbol)[keyof typeof NoteSymbol];
export type MidiString = string;

export type ParsedStep = {
  readonly token: string;
  readonly message: MidiMessage | null;
  readonly holdMs: number;
  readonly velocity: number;
  readonly channel: number;
  readonly filterInfo1?: number;
  readonly filterInfo2?: number;
  readonly sustain?: number;
};

export type ParsedSequenceSummary = {
  readonly channels: readonly number[];
  readonly totalDurationMs: number;
  readonly stepsByChannel: Readonly<Record<number, readonly ParsedStep[]>>;
};

export type ParsedSequence = {
  readonly steps: readonly ParsedStep[];
  readonly summary: ParsedSequenceSummary;
};

export function summarizeParsedSteps(steps: readonly ParsedStep[]): ParsedSequenceSummary {
  const byChannel = new Map<number, ParsedStep[]>();
  let totalDurationMs = 0;

  for (const step of steps) {
    totalDurationMs += step.holdMs;

    const existing = byChannel.get(step.channel);
    if (existing) {
      existing.push(step);
    } else {
      byChannel.set(step.channel, [step]);
    }
  }

  const channels = Array.from(byChannel.keys()).sort((a, b) => a - b);
  const stepsByChannel: Record<number, readonly ParsedStep[]> = {};

  for (const channel of channels) {
    const channelSteps = byChannel.get(channel) ?? [];
    stepsByChannel[channel] = channelSteps;
  }

  return {
    channels,
    totalDurationMs,
    stepsByChannel,
  };
}

export const COMPLETE_CHROMATIC_MIDI_SCALE: readonly number[] = Object.freeze(
  Array.from({ length: 128 }, (_, midiNote) => midiNote),
);

export const VAN_HALEN_JUMP_RIFF: MidiString =
  "C4-h190-v108-ch1 C4-h190-v106-ch1 D4-h220-v114-ch1 C4-h190-v108-ch1 A3-h220-v104-ch1 " +
  "C4-h190-v108-ch1 D4-h220-v114-ch1 E4-h240-v118-ch1 D4-h220-v112-ch1 C4-h190-v108-ch1 " +
  "A3-h220-v104-ch1 G3-h240-v100-ch1 A3-h220-v104-ch1 C4-h190-v108-ch1 D4-h220-v114-ch1 " +
  "E4-h240-v118-ch1 D4-h220-v112-ch1 C4-h190-v108-ch1 A3-h220-v104-ch1 G3-h260-v100-ch1";

export type MidiSong = {
  readonly id: string;
  readonly title: string;
  readonly sequence: MidiString;
};

export const BINARY_FINARY_1998_ORIGINAL_MIX: MidiString =
  "G3-h190-v114-ch1-f12400-f21.7-s0.58 D4-h190-v92-ch2-f11480-f21.2-s0.76 G2-h190-v96-ch3-f1900-f20.9-s0.34 " +
  "C4-h190-v110-ch1-f12300-f21.6-s0.58 G4-h190-v90-ch2-f11420-f21.15-s0.75 C3-h190-v96-ch3-f1880-f20.88-s0.34 " +
  "Bb3-h190-v108-ch1-f12240-f21.6-s0.57 F4-h190-v88-ch2-f11380-f21.1-s0.74 Bb2-h190-v95-ch3-f1840-f20.86-s0.33 " +
  "Eb4-h190-v112-ch1-f12440-f21.7-s0.58 Bb4-h190-v92-ch2-f11510-f21.2-s0.76 Eb3-h190-v97-ch3-f1920-f20.9-s0.34 " +
  "F4-h190-v114-ch1-f12500-f21.75-s0.59 C5-h190-v94-ch2-f11600-f21.25-s0.77 F3-h190-v98-ch3-f1960-f20.93-s0.35 " +
  "G4-h220-v120-ch1-f12700-f21.9-s0.6 D5-h220-v98-ch2-f11780-f21.3-s0.78 G3-h220-v102-ch3-f2020-f20.96-s0.36 " +
  "Eb4-h190-v112-ch1-f12420-f21.7-s0.58 Bb4-h190-v92-ch2-f11520-f21.2-s0.76 Eb3-h190-v97-ch3-f1920-f20.9-s0.34 " +
  "F4-h190-v114-ch1-f12510-f21.76-s0.59 C5-h190-v94-ch2-f11640-f21.26-s0.77 F3-h190-v98-ch3-f1960-f20.93-s0.35 " +
  "G4-h220-v120-ch1-f12740-f21.92-s0.6 D5-h220-v98-ch2-f11810-f21.3-s0.78 G3-h220-v102-ch3-f2030-f20.97-s0.36 " +
  "C4-h200-v110-ch1-f12320-f21.62-s0.58 G4-h200-v90-ch2-f11410-f21.14-s0.75 C3-h200-v96-ch3-f1880-f20.88-s0.34 " +
  "D4-h200-v112-ch1-f12390-f21.66-s0.58 A4-h200-v92-ch2-f11490-f21.18-s0.75 D3-h200-v97-ch3-f1890-f20.89-s0.34 " +
  "Eb4-h200-v114-ch1-f12470-f21.72-s0.59 Bb4-h200-v94-ch2-f11570-f21.22-s0.76 Eb3-h200-v98-ch3-f1930-f20.91-s0.35 " +
  "F4-h200-v116-ch1-f12540-f21.78-s0.59 C5-h200-v96-ch2-f11640-f21.26-s0.77 F3-h200-v99-ch3-f1970-f20.94-s0.35 " +
  "G4-h240-v122-ch1-f12820-f22-s0.61 D5-h240-v100-ch2-f11920-f21.35-s0.79 G3-h240-v103-ch3-f2060-f21-s0.37";

export const MIDI_SONG_LIBRARY: readonly MidiSong[] = Object.freeze([
  {
    id: "van-halen-jump",
    title: "Van Halen - Jump",
    sequence: VAN_HALEN_JUMP_RIFF,
  },
  {
    id: "binary-finary-1998-original-mix",
    title: "Binary Finary - 1998 (Original Mix)",
    sequence: BINARY_FINARY_1998_ORIGINAL_MIX,
  },
]);

export class MidiStringParser {
  private readonly defaultHoldMs: number;
  private readonly defaultVelocity: number;
  private readonly defaultChannel: number;

  public constructor(defaults?: {
    readonly holdMs?: number;
    readonly velocity?: number;
    readonly channel?: number;
  }) {
    this.defaultHoldMs = defaults?.holdMs ?? 235;
    this.defaultVelocity = defaults?.velocity ?? 100;
    this.defaultChannel = defaults?.channel ?? 1;
  }

  private static readonly semitoneBySymbol: Record<NoteSymbol, number> = {
    [NoteSymbol.C]: 0,
    [NoteSymbol.BSharp]: 0,
    [NoteSymbol.CSharp]: 1,
    [NoteSymbol.DFlat]: 1,
    [NoteSymbol.D]: 2,
    [NoteSymbol.DSharp]: 3,
    [NoteSymbol.EFlat]: 3,
    [NoteSymbol.E]: 4,
    [NoteSymbol.FFlat]: 4,
    [NoteSymbol.ESharp]: 5,
    [NoteSymbol.F]: 5,
    [NoteSymbol.FSharp]: 6,
    [NoteSymbol.GFlat]: 6,
    [NoteSymbol.G]: 7,
    [NoteSymbol.GSharp]: 8,
    [NoteSymbol.AFlat]: 8,
    [NoteSymbol.A]: 9,
    [NoteSymbol.ASharp]: 10,
    [NoteSymbol.BFlat]: 10,
    [NoteSymbol.B]: 11,
    [NoteSymbol.CFlat]: 11,
  };

  public parse(input: MidiString): readonly ParsedStep[] {
    const tokens = input.split(/\s+/).filter((t) => t.length > 0);
    const steps: ParsedStep[] = [];

    for (const token of tokens) {
      steps.push(this.parseTokenToStep(token));
    }

    return steps;
  }

  public parseWithSummary(input: MidiString): ParsedSequence {
    const steps = this.parse(input);
    return {
      steps,
      summary: summarizeParsedSteps(steps),
    };
  }

  private parseTokenToStep(token: string): ParsedStep {
    const [baseToken, ...modifiers] = token.split("-");
    const note = this.parseTokenToMidiNote(baseToken);
    const options = this.parseModifiers(modifiers);

    const channelNumber = options.channel ?? this.defaultChannel;
    const velocityNumber = options.velocity ?? this.defaultVelocity;
    const holdMs = options.holdMs ?? this.defaultHoldMs;

    if (note === null) {
      return {
        token,
        message: null,
        holdMs,
        velocity: velocityNumber,
        channel: channelNumber,
        filterInfo1: options.filterInfo1,
        filterInfo2: options.filterInfo2,
        sustain: options.sustain,
      };
    }

    const channel = MidiChannel.create(channelNumber);
    const velocity = MidiVelocity.create(velocityNumber);

    return {
      token,
      message: createNoteOn(channel, note, velocity),
      holdMs,
      velocity: velocityNumber,
      channel: channelNumber,
      filterInfo1: options.filterInfo1,
      filterInfo2: options.filterInfo2,
      sustain: options.sustain,
    };
  }

  private parseModifiers(modifiers: readonly string[]): {
    readonly holdMs?: number;
    readonly velocity?: number;
    readonly channel?: number;
    readonly filterInfo1?: number;
    readonly filterInfo2?: number;
    readonly sustain?: number;
  } {
    let holdMs: number | undefined;
    let velocity: number | undefined;
    let channel: number | undefined;
    let filterInfo1: number | undefined;
    let filterInfo2: number | undefined;
    let sustain: number | undefined;

    for (const modifier of modifiers) {
      if (/^h\d{1,4}$/.test(modifier)) {
        holdMs = Number(modifier.slice(1));
        continue;
      }

      if (/^v(\d|[1-9]\d|1[01]\d|12[0-7])$/.test(modifier)) {
        velocity = Number(modifier.slice(1));
        continue;
      }

      if (/^ch([1-9]|1[0-6])$/.test(modifier)) {
        channel = Number(modifier.slice(2));
        continue;
      }

      if (/^f1\d+(?:\.\d+)?$/.test(modifier)) {
        filterInfo1 = Number(modifier.slice(2));
        continue;
      }

      if (/^f2\d+(?:\.\d+)?$/.test(modifier)) {
        filterInfo2 = Number(modifier.slice(2));
        continue;
      }

      if (/^s(?:0(?:\.\d+)?|1(?:\.0+)?)$/.test(modifier)) {
        sustain = Number(modifier.slice(1));
        continue;
      }

      throw new Error(
        `Unsupported modifier '${modifier}' in token '${modifiers.join("-")}'. Use h###, v###, ch#, f1#, f2#, s0..1.`,
      );
    }

    return {
      holdMs,
      velocity,
      channel,
      filterInfo1,
      filterInfo2,
      sustain,
    };
  }

  private parseTokenToMidiNote(token: string): MidiNote | null {
    if (token === "R") {
      return null;
    }

    const directMidiMatch = /^N(\d|[1-9]\d|1[01]\d|12[0-7])$/.exec(token);

    if (directMidiMatch) {
      return MidiNote.create(Number(directMidiMatch[1]));
    }

    const match = /^([A-G](?:#|b)?)(-1|[0-9])$/.exec(token);

    if (!match) {
      throw new Error(`Invalid note token '${token}'. Use C-1..G9, accidentals (#/b), N0..N127, or R.`);
    }

    const symbol = match[1] as NoteSymbol;
    const octave = Number(match[2]);
    const semitone = MidiStringParser.semitoneBySymbol[symbol];

    if (semitone === undefined) {
      throw new Error(`Unsupported note symbol '${symbol}'.`);
    }

    const midiNumber = (octave + 1) * 12 + semitone;

    if (midiNumber < 0 || midiNumber > 127) {
      throw new Error(`Note token '${token}' resolves to out-of-range MIDI note ${midiNumber}. Expected 0..127.`);
    }

    return MidiNote.create(midiNumber);
  }
}