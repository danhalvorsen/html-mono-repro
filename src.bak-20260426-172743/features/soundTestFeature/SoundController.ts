import type { MidiMessage } from "@monorepo/music-core-midi";
import {
  OscillatorKind,
  OscillatorWaveformKind,
  type IBasicOscillatorDefinition,
  type OscillatorWaveformKind as OscillatorWaveformKindValue,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";
import {
  WebAudioOscillatorGraphFactory,
  type IWebAudioConnectable,
  type IWebAudioOscillatorGraph,
} from "@monorepo/music-core-synthesizer-oscillators-web-audio";

import { BrowserWebAudioContextAdapter } from "./BrowserWebAudioContextAdapter.js";
import { MidiNoteFrequencyMapper } from "./MidiNoteFrequencyMapper.js";

const MidiMessageStatus = {
  NoteOff: 0x80,
  NoteOn: 0x90,
} as const;

export interface ISoundControllerOscillatorState {
  readonly waveform: OscillatorWaveformKindValue;
  readonly gain: number;
  readonly detuneCents: number;
}

export class SoundController {
  private readonly frequencyMapper = new MidiNoteFrequencyMapper();

  private context: AudioContext | null = null;
  private graphFactory: WebAudioOscillatorGraphFactory | null = null;
  private masterGain: GainNode | null = null;
  private activeGraph: IWebAudioOscillatorGraph | null = null;

  private oscillatorState: ISoundControllerOscillatorState = {
    waveform: OscillatorWaveformKind.Sawtooth,
    gain: 0.35,
    detuneCents: 0,
  };

  public async init(): Promise<void> {
    if (this.context !== null) {
      await this.context.resume();
      return;
    }

    const context = new AudioContext();
    await context.resume();

    const masterGain = context.createGain();
    masterGain.gain.value = 0.75;
    masterGain.connect(context.destination);

    this.context = context;
    this.masterGain = masterGain;
    this.graphFactory = WebAudioOscillatorGraphFactory.createDefault(
      new BrowserWebAudioContextAdapter(context),
    );
  }

  public setOscillatorState(state: ISoundControllerOscillatorState): void {
    this.oscillatorState = state;
  }

  public async handleMidiMessage(message: MidiMessage): Promise<void> {
    await this.init();

    switch (message.status) {
      case MidiMessageStatus.NoteOn:
        this.noteOn(message.note.value(), message.velocity.value() / 127);
        return;

      case MidiMessageStatus.NoteOff:
        this.noteOff();
        return;
    }
  }

  public noteOn(
    midiNote: number,
    velocity: number,
  ): void {
    if (this.context === null || this.graphFactory === null || this.masterGain === null) {
      throw new Error("SoundController must be initialized before noteOn.");
    }

    this.noteOff();

    const frequencyHz = this.frequencyMapper.toFrequencyHz(midiNote);
    const graph = this.graphFactory.create(this.createOscillatorDefinition());

    graph.connect(this.masterGain as unknown as IWebAudioConnectable);
    graph.noteOn({
      timeSeconds: this.context.currentTime,
      frequencyHz,
      velocity,
    });

    this.activeGraph = graph;
  }

  public noteOff(): void {
    if (this.context === null || this.activeGraph === null) {
      return;
    }

    this.activeGraph.noteOff({
      timeSeconds: this.context.currentTime,
    });

    this.activeGraph.disconnect();
    this.activeGraph = null;
  }

  private createOscillatorDefinition(): IBasicOscillatorDefinition {
    return {
      kind: OscillatorKind.Basic,
      waveform: this.oscillatorState.waveform,
      frequencyHz: 440,
      detuneCents: this.oscillatorState.detuneCents,
      phaseRadians: 0,
      gain: this.oscillatorState.gain,
    };
  }
}
