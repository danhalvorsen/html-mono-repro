import {
  assertMidi1Channel,
  assertMidi1PitchBend14Bit,
  assertMidi1Value7Bit,
  type IMidi1HighLevelInterface,
  type MIDI1Channel,
  type MIDI1ClockSignal,
  type MIDI1ControlChangeEvent,
  type MIDI1NoteEvent,
  type MIDI1PitchBendEvent,
  type MIDI1ProgramChangeEvent,
  type MIDI1PitchBend14Bit,
  type MIDI1Value7Bit,
} from "@monorepo/music-core-midi";

type ListenerMap<TEvent> = Map<string, Array<(event: TEvent) => void>>;

export const MIDI1ImplementationCapabilities = Object.freeze({
  inboundListeners: true,
  outboundCommands: true,
  realtimeSignals: true,
  channelUtilities: true,
  strictValidation: true,
});

const CLOCK_SIGNALS = ["clock", "start", "stop", "continue"] as const;
const ALL_NOTES_OFF_CC = 123;
const ALL_SOUND_OFF_CC = 120;
const RESET_ALL_CONTROLLERS_CC = 121;

export class Midi1HighLevelPlayback implements IMidi1HighLevelInterface {
  public readonly MIDI1AllNotesOffCC = ALL_NOTES_OFF_CC;
  public readonly MIDI1AllSoundOffCC = ALL_SOUND_OFF_CC;
  public readonly MIDI1ResetAllControllersCC = RESET_ALL_CONTROLLERS_CC;

  private readonly noteOnListeners: ListenerMap<MIDI1NoteEvent> = new Map();
  private readonly noteOffListeners: ListenerMap<MIDI1NoteEvent> = new Map();
  private readonly controlChangeListeners: ListenerMap<MIDI1ControlChangeEvent> = new Map();
  private readonly pitchBendListeners: ListenerMap<MIDI1PitchBendEvent> = new Map();
  private readonly programChangeListeners: ListenerMap<MIDI1ProgramChangeEvent> = new Map();

  public onNoteOn(portId: string, callback: (event: MIDI1NoteEvent) => void): void {
    this.addListener(this.noteOnListeners, portId, callback);
  }

  public onNoteOff(portId: string, callback: (event: MIDI1NoteEvent) => void): void {
    this.addListener(this.noteOffListeners, portId, callback);
  }

  public onControlChange(portId: string, callback: (event: MIDI1ControlChangeEvent) => void): void {
    this.addListener(this.controlChangeListeners, portId, callback);
  }

  public onPitchBend(portId: string, callback: (event: MIDI1PitchBendEvent) => void): void {
    this.addListener(this.pitchBendListeners, portId, callback);
  }

  public onProgramChange(portId: string, callback: (event: MIDI1ProgramChangeEvent) => void): void {
    this.addListener(this.programChangeListeners, portId, callback);
  }

  public sendNoteOn(portId: string, channel: MIDI1Channel, note: MIDI1Value7Bit, velocity: MIDI1Value7Bit, timestamp: number = performance.now()): void {
    assertMidi1Channel(channel);
    assertMidi1Value7Bit(note);
    assertMidi1Value7Bit(velocity);

    this.emit(this.noteOnListeners, portId, {
      channel,
      noteNumber: note,
      velocity,
      timestamp,
    });
  }

  public sendNoteOff(portId: string, channel: MIDI1Channel, note: MIDI1Value7Bit, velocity: MIDI1Value7Bit, timestamp: number = performance.now()): void {
    assertMidi1Channel(channel);
    assertMidi1Value7Bit(note);
    assertMidi1Value7Bit(velocity);

    this.emit(this.noteOffListeners, portId, {
      channel,
      noteNumber: note,
      velocity,
      timestamp,
    });
  }

  public sendControlChange(portId: string, channel: MIDI1Channel, controller: MIDI1Value7Bit, value: MIDI1Value7Bit, timestamp: number = performance.now()): void {
    assertMidi1Channel(channel);
    assertMidi1Value7Bit(controller);
    assertMidi1Value7Bit(value);

    this.emit(this.controlChangeListeners, portId, {
      channel,
      controllerNumber: controller,
      value,
      timestamp,
    });
  }

  public sendPitchBend(portId: string, channel: MIDI1Channel, value: MIDI1PitchBend14Bit, timestamp: number = performance.now()): void {
    assertMidi1Channel(channel);
    assertMidi1PitchBend14Bit(value);

    this.emit(this.pitchBendListeners, portId, {
      channel,
      value,
      timestamp,
    });
  }

  public sendProgramChange(portId: string, channel: MIDI1Channel, programNumber: MIDI1Value7Bit, timestamp: number = performance.now()): void {
    assertMidi1Channel(channel);
    assertMidi1Value7Bit(programNumber);

    this.emit(this.programChangeListeners, portId, {
      channel,
      programNumber,
      timestamp,
    });
  }

  public sendClockSignal(_portId: string, signal: MIDI1ClockSignal): void {
    if (!CLOCK_SIGNALS.includes(signal)) {
      throw new RangeError(`Invalid MIDI1 clock signal: ${signal}`);
    }
  }

  public sendAllNotesOff(portId: string, channel: MIDI1Channel): void {
    this.sendControlChange(portId, channel, ALL_NOTES_OFF_CC, 0);
  }

  public sendAllSoundOff(portId: string, channel: MIDI1Channel): void {
    this.sendControlChange(portId, channel, ALL_SOUND_OFF_CC, 0);
  }

  public sendResetAllControllers(portId: string, channel: MIDI1Channel): void {
    this.sendControlChange(portId, channel, RESET_ALL_CONTROLLERS_CC, 0);
  }

  private addListener<TEvent>(registry: ListenerMap<TEvent>, portId: string, callback: (event: TEvent) => void): void {
    const listeners = registry.get(portId);
    if (listeners === undefined) {
      registry.set(portId, [callback]);
      return;
    }
    listeners.push(callback);
  }

  private emit<TEvent>(registry: ListenerMap<TEvent>, portId: string, event: TEvent): void {
    for (const listener of registry.get(portId) ?? []) {
      listener(event);
    }
  }
}

export function createMidi1HighLevelPlayback(): IMidi1HighLevelInterface {
  return new Midi1HighLevelPlayback();
}
