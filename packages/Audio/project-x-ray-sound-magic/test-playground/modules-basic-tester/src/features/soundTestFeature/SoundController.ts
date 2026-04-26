// FILE: test-playground/modules-basic-tester/src/features/soundTestFeature/SoundController.ts

import type { MidiMessage } from "@monorepo/music-core-midi";
import {
  OscillatorKind,
  OscillatorWaveformKind,
  type IBasicOscillatorDefinition,
  type OscillatorDefinition,
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

export type OscillatorIndex = 0 | 1;

export class SoundController {
  private readonly frequencyMapper = new MidiNoteFrequencyMapper();

  private context: AudioContext | null = null;
  private graphFactory: WebAudioOscillatorGraphFactory | null = null;
  private masterGain: GainNode | null = null;
  private activeGraphs: IWebAudioOscillatorGraph[] = [];

  private readonly oscillatorDefinitions: [
    OscillatorDefinition,
    OscillatorDefinition,
  ] = [
    {
      kind: OscillatorKind.Basic,
      waveform: OscillatorWaveformKind.Sawtooth,
      frequencyHz: 440,
      detuneCents: -7,
      phaseRadians: 0,
      gain: 0.45,
    },
    {
      kind: OscillatorKind.Basic,
      waveform: OscillatorWaveformKind.Square,
      frequencyHz: 440,
      detuneCents: 7,
      phaseRadians: 0,
      gain: 0.35,
    },
  ];

  public getOscillatorDefinition(index: OscillatorIndex): OscillatorDefinition {
    return this.oscillatorDefinitions[index];
  }

  public setOscillatorDefinition(
    index: OscillatorIndex,
    definition: OscillatorDefinition,
  ): void {
    this.oscillatorDefinitions[index] = definition;
  }

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

  public noteOn(midiNote: number, velocity: number): void {
    if (this.context === null || this.graphFactory === null || this.masterGain === null) {
      throw new Error("SoundController must be initialized before noteOn.");
    }

    this.noteOff();

    const frequencyHz = this.frequencyMapper.toFrequencyHz(midiNote);

    for (const definition of this.oscillatorDefinitions) {
      const graph = this.graphFactory.create(
        this.withRuntimeFrequency(definition, frequencyHz),
      );

      graph.connect(this.masterGain as unknown as IWebAudioConnectable);
      graph.noteOn({
        timeSeconds: this.context.currentTime,
        frequencyHz,
        velocity,
      });

      this.activeGraphs.push(graph);
    }
  }

  public noteOff(): void {
    if (this.context === null) {
      return;
    }

    const graphs = this.activeGraphs;
    this.activeGraphs = [];

    for (const graph of graphs) {
      graph.noteOff({
        timeSeconds: this.context.currentTime,
      });

      graph.disconnect();
    }
  }

  private withRuntimeFrequency(
    definition: OscillatorDefinition,
    frequencyHz: number,
  ): OscillatorDefinition {
    if (definition.kind !== OscillatorKind.Basic) {
      return definition;
    }

    const basicDefinition: IBasicOscillatorDefinition = {
      ...definition,
      frequencyHz,
    };

    return basicDefinition;
  }
}