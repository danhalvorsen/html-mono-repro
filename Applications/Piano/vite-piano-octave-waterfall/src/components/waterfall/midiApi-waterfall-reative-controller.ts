import type {
    MidiControllerOptions,
    MidiParsedEvent,
    MidiParsedNoteEvent,
    MidiSystemType,
} from "@monorepo/music-core-midi";
import type { ReactiveController, ReactiveControllerHost } from "lit";

export type MidiWaterfallNoteEvent = Readonly<{
  columnIndex: number;
  midiNote: number;
  pitchClass: number;
  octave: number;
  channel: number;
  velocity: number;
  holdMs: number;
}>;

export interface midiAPI {
  onMIDISuccess(midiAccess: MIDIAccess): void;
  onMIDIFailure(error: Error): void;
  onNote(midiMessageEvent: MIDIMessageEvent): void;
  onMidiMessage?(midiMessageEvent: MIDIMessageEvent): void;
  onMidiEvent?(event: MidiParsedEvent): void;
  onNoteEvent?(event: MidiParsedNoteEvent): void;
  onNoteOn?(event: MidiParsedNoteEvent): void;
  onNoteOff?(event: MidiParsedNoteEvent): void;
  onWaterfallNote?(event: MidiWaterfallNoteEvent): void;
}

export class MidiAPIReactiveController implements ReactiveController {
  readonly #api: midiAPI;
  readonly #options: MidiControllerOptions;
  readonly #activeNotes = new Map<string, MidiParsedNoteEvent>();

  #midiAccess: MIDIAccess | null = null;

  public constructor(
    private readonly host: ReactiveControllerHost,
    api: midiAPI,
    options: MidiControllerOptions = {},
  ) {
    this.#api = api;
    this.#options = options;
    host.addController(this);
  }

  public hostConnected(): void {
    this.connect().catch((error: unknown) => {
      const midiError = error instanceof Error
        ? error
        : new Error("Failed to initialize Web MIDI API.");
      this.#api.onMIDIFailure(midiError);
    });
  }

  public hostDisconnected(): void {
    this.disconnect();
    this.#activeNotes.clear();
  }

  private async connect(): Promise<void> {
    if (!("requestMIDIAccess" in navigator)) {
      this.#api.onMIDIFailure(new Error("Web MIDI API is not supported in this browser."));
      return;
    }

    const midiAccess = await navigator.requestMIDIAccess();
    this.#midiAccess = midiAccess;

    this.#midiAccess.onstatechange = this.onStateChange;
    this.bindInputs();
    this.#api.onMIDISuccess(midiAccess);
  }

  private disconnect(): void {
    if (this.#midiAccess === null) {
      return;
    }

    this.#midiAccess.onstatechange = null;

    this.#midiAccess.inputs.forEach((input) => {
      input.onmidimessage = null;
    });

    this.#midiAccess = null;
  }

  private readonly onStateChange = (): void => {
    this.bindInputs();
  };

  private bindInputs(): void {
    if (this.#midiAccess === null) {
      return;
    }

    this.#midiAccess.inputs.forEach((input) => {
      input.onmidimessage = this.onMidiMessage;
    });
  }

  private readonly onMidiMessage = (midiMessageEvent: MIDIMessageEvent): void => {
    this.#api.onMidiMessage?.(midiMessageEvent);
    this.#api.onNote(midiMessageEvent);

    const parsedEvent = this.parseEvent(midiMessageEvent);
    this.#api.onMidiEvent?.(parsedEvent);

    if (parsedEvent.type !== "noteon" && parsedEvent.type !== "noteoff") {
      return;
    }

    if (!this.matchesFilters(parsedEvent)) {
      return;
    }

    this.#api.onNoteEvent?.(parsedEvent);

    if (parsedEvent.type === "noteon") {
      this.#activeNotes.set(this.noteKey(parsedEvent), parsedEvent);
      this.#api.onNoteOn?.(parsedEvent);
      return;
    }

    const key = this.noteKey(parsedEvent);
    const startedNote = this.#activeNotes.get(key);

    if (startedNote !== undefined) {
      const holdMs = Math.max(0, parsedEvent.timestamp - startedNote.timestamp);

      this.#api.onWaterfallNote?.({
        columnIndex: parsedEvent.columnIndex,
        midiNote: parsedEvent.midiNote,
        pitchClass: parsedEvent.pitchClass,
        octave: parsedEvent.octave,
        channel: parsedEvent.channel,
        velocity: startedNote.velocity,
        holdMs,
      });

      this.#activeNotes.delete(key);
    }

    this.#api.onNoteOff?.(parsedEvent);
  };

  private parseEvent(midiMessageEvent: MIDIMessageEvent): MidiParsedEvent {
    const midiData = midiMessageEvent.data ?? new Uint8Array();
    const data = Array.from(midiData);
    const status = data[0] ?? 0;
    const data1 = data[1] ?? 0;
    const data2 = data[2] ?? 0;

    const channel = status < 0xF0 ? status & 0x0F : null;
    const baseEvent = {
      status,
      data,
      timestamp: midiMessageEvent.timeStamp,
      channel,
    } as const;

    if (status >= 0x80 && status <= 0xEF) {
      const messageClass = status & 0xF0;

      if (messageClass === 0x80 || messageClass === 0x90) {
        const isNoteOff = messageClass === 0x80 || (messageClass === 0x90 && data2 === 0);
        const midiNote = data1;
        const pitchClass = midiNote % 12;
        const octave = Math.floor(midiNote / 12) - 1;

        return {
          ...baseEvent,
          type: isNoteOff ? "noteoff" : "noteon",
          channel: channel ?? 0,
          midiNote,
          velocity: data2,
          pitchClass,
          octave,
          columnIndex: pitchClass,
        };
      }

      if (messageClass === 0xA0) {
        return { ...baseEvent, type: "poly-aftertouch" };
      }

      if (messageClass === 0xB0) {
        return { ...baseEvent, type: "control-change" };
      }

      if (messageClass === 0xC0) {
        return { ...baseEvent, type: "program-change" };
      }

      if (messageClass === 0xD0) {
        return { ...baseEvent, type: "channel-aftertouch" };
      }

      if (messageClass === 0xE0) {
        return { ...baseEvent, type: "pitch-bend" };
      }
    }

    if (status >= 0xF0) {
      return {
        ...baseEvent,
        type: this.parseSystemType(status),
      };
    }

    return {
      ...baseEvent,
      type: "unknown",
    };
  }

  private parseSystemType(status: number): MidiSystemType {
    if (status === 0xF0) {
      return "system-exclusive";
    }
    if (status === 0xF1) {
      return "time-code-quarter-frame";
    }
    if (status === 0xF2) {
      return "song-position-pointer";
    }
    if (status === 0xF3) {
      return "song-select";
    }
    if (status === 0xF6) {
      return "tune-request";
    }
    if (status === 0xF8) {
      return "timing-clock";
    }
    if (status === 0xFA) {
      return "start";
    }
    if (status === 0xFB) {
      return "continue";
    }
    if (status === 0xFC) {
      return "stop";
    }
    if (status === 0xFE) {
      return "active-sensing";
    }
    if (status === 0xFF) {
      return "reset";
    }

    return "unknown-system";
  }

  private matchesFilters(event: MidiParsedNoteEvent): boolean {
    const { channelFilter, octaveWindow } = this.#options;

    if (channelFilter !== undefined && event.channel !== channelFilter) {
      return false;
    }

    if (
      octaveWindow !== undefined &&
      (event.octave < octaveWindow.min || event.octave > octaveWindow.max)
    ) {
      return false;
    }

    return true;
  }

  private noteKey(event: MidiParsedNoteEvent): string {
    return `${event.channel}:${event.midiNote}`;
  }
}