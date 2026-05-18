export type MIDI1Channel =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export type MIDI1Value7Bit = number;
export type MIDI1PitchBend14Bit = number;

export const MIDI1ChannelMin = 1;
export const MIDI1ChannelMax = 16;
export const MIDI1Value7BitMin = 0;
export const MIDI1Value7BitMax = 127;
export const MIDI1PitchBend14BitMin = 0;
export const MIDI1PitchBend14BitCenter = 8192;
export const MIDI1PitchBend14BitMax = 16383;

export const MIDI1ClockSignals = ["clock", "start", "stop", "continue"] as const;
export type MIDI1ClockSignal = (typeof MIDI1ClockSignals)[number];

export const MIDI1AllNotesOffCC = 123;
export const MIDI1AllSoundOffCC = 120;
export const MIDI1ResetAllControllersCC = 121;

export interface MIDI1NoteEvent {
  readonly channel: MIDI1Channel;
  readonly noteNumber: MIDI1Value7Bit;
  readonly velocity: MIDI1Value7Bit;
  readonly timestamp: number;
}

export interface MIDI1ControlChangeEvent {
  readonly channel: MIDI1Channel;
  readonly controllerNumber: MIDI1Value7Bit;
  readonly value: MIDI1Value7Bit;
  readonly timestamp: number;
}

export interface MIDI1PitchBendEvent {
  readonly channel: MIDI1Channel;
  readonly value: MIDI1PitchBend14Bit;
  readonly timestamp: number;
}

export interface MIDI1ProgramChangeEvent {
  readonly channel: MIDI1Channel;
  readonly programNumber: MIDI1Value7Bit;
  readonly timestamp: number;
}

export interface IMidi1HighLevelInterface {
  onNoteOn(portId: string, callback: (event: MIDI1NoteEvent) => void): void;
  onNoteOff(portId: string, callback: (event: MIDI1NoteEvent) => void): void;
  onControlChange(portId: string, callback: (event: MIDI1ControlChangeEvent) => void): void;
  onPitchBend(portId: string, callback: (event: MIDI1PitchBendEvent) => void): void;
  onProgramChange(portId: string, callback: (event: MIDI1ProgramChangeEvent) => void): void;

  sendNoteOn(portId: string, channel: MIDI1Channel, note: MIDI1Value7Bit, velocity: MIDI1Value7Bit, timestamp?: number): void;
  sendNoteOff(portId: string, channel: MIDI1Channel, note: MIDI1Value7Bit, velocity: MIDI1Value7Bit, timestamp?: number): void;
  sendControlChange(portId: string, channel: MIDI1Channel, controller: MIDI1Value7Bit, value: MIDI1Value7Bit, timestamp?: number): void;
  sendPitchBend(portId: string, channel: MIDI1Channel, value: MIDI1PitchBend14Bit, timestamp?: number): void;
  sendProgramChange(portId: string, channel: MIDI1Channel, programNumber: MIDI1Value7Bit, timestamp?: number): void;

  sendClockSignal(portId: string, signal: MIDI1ClockSignal): void;

  sendAllNotesOff(portId: string, channel: MIDI1Channel): void;
  sendAllSoundOff(portId: string, channel: MIDI1Channel): void;
  sendResetAllControllers(portId: string, channel: MIDI1Channel): void;
}

export const IMidi1HighLevelInterfaceSymbol = Symbol("IMidi1HighLevelInterface");

export const MIDI1ListenerMethodNames = {
  onNoteOn: "onNoteOn",
  onNoteOff: "onNoteOff",
  onControlChange: "onControlChange",
  onPitchBend: "onPitchBend",
  onProgramChange: "onProgramChange",
} as const;

export const MIDI1SenderMethodNames = {
  sendNoteOn: "sendNoteOn",
  sendNoteOff: "sendNoteOff",
  sendControlChange: "sendControlChange",
  sendPitchBend: "sendPitchBend",
  sendProgramChange: "sendProgramChange",
  sendClockSignal: "sendClockSignal",
  sendAllNotesOff: "sendAllNotesOff",
  sendAllSoundOff: "sendAllSoundOff",
  sendResetAllControllers: "sendResetAllControllers",
} as const;

export const MIDI1 = {
  range: {
    channel: [MIDI1ChannelMin, MIDI1ChannelMax] as const,
    value7Bit: [MIDI1Value7BitMin, MIDI1Value7BitMax] as const,
    pitchBend14Bit: [MIDI1PitchBend14BitMin, MIDI1PitchBend14BitMax] as const,
    pitchBendCenter: MIDI1PitchBend14BitCenter,
  },
  clockSignals: MIDI1ClockSignals,
  cc: {
    allNotesOff: MIDI1AllNotesOffCC,
    allSoundOff: MIDI1AllSoundOffCC,
    resetAllControllers: MIDI1ResetAllControllersCC,
  },
} as const;

export function assertMidi1Channel(value: number): asserts value is MIDI1Channel {
  if (!Number.isInteger(value) || value < MIDI1ChannelMin || value > MIDI1ChannelMax) {
    throw new RangeError(`MIDI1 channel out of range: ${value}`);
  }
}

export function assertMidi1Value7Bit(value: number): asserts value is MIDI1Value7Bit {
  if (!Number.isInteger(value) || value < MIDI1Value7BitMin || value > MIDI1Value7BitMax) {
    throw new RangeError(`MIDI1 7-bit value out of range: ${value}`);
  }
}

export function assertMidi1PitchBend14Bit(value: number): asserts value is MIDI1PitchBend14Bit {
  if (!Number.isInteger(value) || value < MIDI1PitchBend14BitMin || value > MIDI1PitchBend14BitMax) {
    throw new RangeError(`MIDI1 pitch bend value out of range: ${value}`);
  }
}

export function isMidi1NoteEvent(value: unknown): value is MIDI1NoteEvent {
  if (!isRecord(value)) {
    return false;
  }
  const channel = value["channel"];
  const noteNumber = value["noteNumber"];
  const velocity = value["velocity"];
  const timestamp = value["timestamp"];
  return isIntegerInRange(channel, MIDI1ChannelMin, MIDI1ChannelMax)
    && isIntegerInRange(noteNumber, MIDI1Value7BitMin, MIDI1Value7BitMax)
    && isIntegerInRange(velocity, MIDI1Value7BitMin, MIDI1Value7BitMax)
    && typeof timestamp === "number";
}

export function isMidi1ControlChangeEvent(value: unknown): value is MIDI1ControlChangeEvent {
  if (!isRecord(value)) {
    return false;
  }
  return isIntegerInRange(value["channel"], MIDI1ChannelMin, MIDI1ChannelMax)
    && isIntegerInRange(value["controllerNumber"], MIDI1Value7BitMin, MIDI1Value7BitMax)
    && isIntegerInRange(value["value"], MIDI1Value7BitMin, MIDI1Value7BitMax)
    && typeof value["timestamp"] === "number";
}

export function isMidi1PitchBendEvent(value: unknown): value is MIDI1PitchBendEvent {
  if (!isRecord(value)) {
    return false;
  }
  return isIntegerInRange(value["channel"], MIDI1ChannelMin, MIDI1ChannelMax)
    && isIntegerInRange(value["value"], MIDI1PitchBend14BitMin, MIDI1PitchBend14BitMax)
    && typeof value["timestamp"] === "number";
}

export function isMidi1ProgramChangeEvent(value: unknown): value is MIDI1ProgramChangeEvent {
  if (!isRecord(value)) {
    return false;
  }
  return isIntegerInRange(value["channel"], MIDI1ChannelMin, MIDI1ChannelMax)
    && isIntegerInRange(value["programNumber"], MIDI1Value7BitMin, MIDI1Value7BitMax)
    && typeof value["timestamp"] === "number";
}

export function createMidi1HighLevelInterface(
  implementation: IMidi1HighLevelInterface,
): IMidi1HighLevelInterface {
  return implementation;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isIntegerInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
}
