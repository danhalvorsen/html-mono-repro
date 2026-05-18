import {
  MidiChannel,
  MidiNote,
  MidiVelocity,
  createNoteOff,
  createNoteOn,
  type NoteSymbol,
} from "@monorepo/music-core-midi";
import type { MIDI1NoteEvent } from "@monorepo/music-core-midi";
import { Midi1HighLevelPlayback } from "@monorepo/music-core-midi-accords-playback";
import {
  EnvelopeADSR,
  FilterSettings,
  FilterType,
  WebAudioMidiPlayer,
} from "@monorepo/music-core-midi-playback";
import type { Waterfall } from "../component/Waterfall.ts";

export class MidiMapper {
  private static readonly GravityFallingHeightPixelsPerMillisecond: number = 0.08;
  private static readonly GravityFallingMaximumHeightPixels: number = 180;
  private static readonly MaxAudibleHoldMs: number =
    MidiMapper.GravityFallingMaximumHeightPixels /
    MidiMapper.GravityFallingHeightPixelsPerMillisecond;

  private readonly waterfall: Waterfall;
  private readonly player: WebAudioMidiPlayer;
  private readonly midi: Midi1HighLevelPlayback;

  private activeColumns: number[] = [];
  private activeNoteNumbers: number[] = [];
  private isChordAudible: boolean = false;
  private monitorFrameId: number | null = null;
  private pulseIntervalId: number | null = null;

  public constructor(waterfall: Waterfall) {
    this.waterfall = waterfall;
    this.player = new WebAudioMidiPlayer({
      envelope: EnvelopeADSR.create(0.02, 0.14, 0.72, 0.04),
      filterEnvelope: EnvelopeADSR.create(0.01, 0.2, 0.58, 0.28),
      filter: FilterSettings.create(FilterType.LowPass, 1400, 1.1),
      noteLengthSeconds: 0,
    });

    this.midi = new Midi1HighLevelPlayback();
    this.midi.onNoteOn("waterfall", (event: MIDI1NoteEvent) => {
      this.player.play(
        createNoteOn(
          MidiChannel.create(event.channel),
          MidiNote.create(event.noteNumber),
          MidiVelocity.create(event.velocity),
        ),
        { noteLengthSeconds: 0.14 },
      );
    });
    this.midi.onNoteOff("waterfall", (event: MIDI1NoteEvent) => {
      this.player.play(
        createNoteOff(
          MidiChannel.create(event.channel),
          MidiNote.create(event.noteNumber),
          MidiVelocity.create(event.velocity),
        ),
      );
    });
  }

  public start(notes: Array<NoteSymbol>): void {
    this.stop(true);

    const noteNumbers = notes.map(noteSymbolToMidi4);
    const columns: number[] = [];

    for (const noteNumber of noteNumbers) {
      const columnIndex = noteNumber % 12;
      this.waterfall.createGavityFallingObjectInColumn(columnIndex, 0);
      columns.push(columnIndex);
    }

    this.activeColumns = columns;
    this.activeNoteNumbers = noteNumbers;
    this.isChordAudible = this.activeNoteNumbers.length > 0;
    this.startPulsePlayback();
    this.startAudioLifecycleMonitor();
  }

  public update(heldMs: number): void {
    const hold = Math.max(0, Math.round(heldMs));
    for (const columnIndex of this.activeColumns) {
      this.waterfall.updateGavityFallingObjectHeightInColumn(columnIndex, hold);
    }

    if (
      this.isChordAudible &&
      hold >= MidiMapper.MaxAudibleHoldMs
    ) {
      this.stopMidiChord();
    }
  }

  public stop(cancel: boolean, heldMs: number = 0): void {
    this.stopAudioLifecycleMonitor();
    this.stopPulsePlayback();
    this.stopMidiChord();

    const hold = Math.max(0, Math.round(heldMs));
    for (const columnIndex of this.activeColumns) {
      if (cancel) {
        this.waterfall.cancelGavityFallingObjectInColumn(columnIndex);
      } else {
        this.waterfall.completeGavityFallingObjectInColumn(columnIndex, hold);
      }
    }

    this.activeColumns = [];
    this.activeNoteNumbers = [];
  }

  private startPulsePlayback(): void {
    this.stopPulsePlayback();

    const playPulse = (): void => {
      if (!this.isChordAudible) {
        return;
      }

      for (const noteNumber of this.activeNoteNumbers) {
        this.midi.sendNoteOn("waterfall", 1, noteNumber, 108);
      }
    };

    playPulse();
    this.pulseIntervalId = window.setInterval(playPulse, 110);
  }

  private stopPulsePlayback(): void {
    if (this.pulseIntervalId === null) {
      return;
    }

    window.clearInterval(this.pulseIntervalId);
    this.pulseIntervalId = null;
  }

  private stopMidiChord(): void {
    if (!this.isChordAudible) {
      return;
    }

    for (const noteNumber of this.activeNoteNumbers) {
      this.midi.sendNoteOff("waterfall", 1, noteNumber, 0);
    }

    this.isChordAudible = false;
  }

  private startAudioLifecycleMonitor(): void {
    this.stopAudioLifecycleMonitor();
    this.monitorFrameId = requestAnimationFrame(this.onMonitorFrame);
  }

  private stopAudioLifecycleMonitor(): void {
    if (this.monitorFrameId === null) {
      return;
    }

    cancelAnimationFrame(this.monitorFrameId);
    this.monitorFrameId = null;
  }

  private readonly onMonitorFrame = (): void => {
    if (this.activeColumns.length === 0) {
      this.monitorFrameId = null;
      return;
    }

    const hasVisibleFallingObjects = this.waterfall.querySelector("gravity-falling") !== null;

    if (!hasVisibleFallingObjects && this.isChordAudible) {
      this.stopPulsePlayback();
      this.stopMidiChord();
      this.monitorFrameId = null;
      return;
    }

    this.monitorFrameId = requestAnimationFrame(this.onMonitorFrame);
  };
}

function noteSymbolToMidi4(note: NoteSymbol): number {
  const semitoneBySymbol: Record<NoteSymbol, number> = {
    C: 0,
    "B#": 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    Fb: 4,
    "E#": 5,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
    Cb: 11,
  };

  const semitone = semitoneBySymbol[note];
  return (4 + 1) * 12 + semitone;
}
