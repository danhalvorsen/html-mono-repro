// packages/Audio/music-core-synthesizer-contracts/src/index.ts

import type { MidiMessage } from "@monorepo/music-core-midi";

/* ============================================================================
   Primitives
============================================================================ */

export type Seconds = number;
export type Hertz = number;
export type MidiNoteNumber = number;
export type Normalized = number; // 0..1

export interface IDisposable {
  dispose(): void;
}

/* ============================================================================
   Definitions (pure data, no behavior)
============================================================================ */

export enum OscillatorWaveform {
  Sine = "sine",
  Square = "square",
  Sawtooth = "sawtooth",
  Triangle = "triangle",
}

export enum FilterType {
  LowPass = "lowpass",
  HighPass = "highpass",
  BandPass = "bandpass",
}

export enum DistortionType {
  None = "none",
  SoftClip = "soft-clip",
  HardClip = "hard-clip",
  Tanh = "tanh",
}

export interface IOscillatorDefinition {
  readonly waveform: OscillatorWaveform;
  readonly detuneCents: number;
  readonly gain: Normalized;
}

export interface INoiseDefinition {
  readonly enabled: boolean;
  readonly gain: Normalized;
}

export interface IEnvelopeDefinition {
  readonly attackSeconds: Seconds;
  readonly decaySeconds: Seconds;
  readonly sustainLevel: Normalized;
  readonly releaseSeconds: Seconds;
}

export interface IFilterDefinition {
  readonly enabled: boolean;
  readonly type: FilterType;
  readonly cutoffHz: Hertz;
  readonly resonanceQ: number;
}

export interface IDistortionDefinition {
  readonly enabled: boolean;
  readonly type: DistortionType;
  readonly amount: Normalized;
}

export interface IVoiceDefinition {
  readonly oscillator: IOscillatorDefinition;
  readonly noise: INoiseDefinition;
  readonly envelope: IEnvelopeDefinition;
  readonly filter: IFilterDefinition;
  readonly distortion: IDistortionDefinition;
}

/* ============================================================================
   Mapping
============================================================================ */

export interface IMidiNoteFrequencyMapper {
  map(note: MidiNoteNumber): Hertz;
}

/* ============================================================================
   Voice lifecycle
============================================================================ */

export interface IVoiceHandle extends IDisposable {
  readonly id: string;
  readonly note: MidiNoteNumber;
  readonly isReleased: boolean;

  start(at: Seconds): void;
  release(at: Seconds): void;
}

/* ============================================================================
   Voice allocation
============================================================================ */

export interface IVoiceAllocator {
  allocate(
    active: readonly IVoiceHandle[],
    note: MidiNoteNumber,
  ): IVoiceHandle | null;
}

/* ============================================================================
   Application layer contracts
============================================================================ */

export interface ISynthEngine extends IDisposable {
  handle(message: MidiMessage): void;
  panic(): void;
  setVoiceDefinition(definition: IVoiceDefinition): void;
}

export interface IMidiMessageRouter {
  route(message: MidiMessage): void;
}

export interface INoteLifetimeCoordinator {
  noteOn(note: MidiNoteNumber, velocity: Normalized, at: Seconds): void;
  noteOff(note: MidiNoteNumber, at: Seconds): void;
  releaseAll(at: Seconds): void;
}

/* ============================================================================
   Web Audio infrastructure contracts
============================================================================ */

export interface IWebAudioContextFactory {
  create(): AudioContext;
}

export interface IWebAudioMasterBus extends IDisposable {
  readonly input: AudioNode;
  readonly output: AudioNode;

  connect(destination: AudioNode): void;
  setGain(value: Normalized, at: Seconds): void;
}

export interface IWebAudioEnvelopeScheduler {
  noteOn(
    param: AudioParam,
    env: IEnvelopeDefinition,
    velocity: Normalized,
    at: Seconds,
  ): void;

  noteOff(
    param: AudioParam,
    env: IEnvelopeDefinition,
    at: Seconds,
  ): void;

  cancel(param: AudioParam, at: Seconds): void;
}

export interface IWebAudioNoiseSourceFactory {
  create(context: AudioContext): AudioNode;
}

export interface IWebAudioVoiceGraph {
  readonly output: AudioNode;
  readonly oscillator: OscillatorNode;
  readonly vca: GainNode;
  readonly filter: BiquadFilterNode | null;
  readonly distortion: WaveShaperNode | null;
  readonly noise: AudioNode | null;
}

export interface IWebAudioVoiceGraphBuilder {
  build(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly frequencyHz: Hertz;
  }): IWebAudioVoiceGraph;
}

export interface IWebAudioVoiceFactory {
  create(request: {
    readonly context: AudioContext;
    readonly destination: AudioNode;
    readonly definition: IVoiceDefinition;
    readonly note: MidiNoteNumber;
    readonly velocity: Normalized;
    readonly frequencyHz: Hertz;
    readonly startedAt: Seconds;
  }): IVoiceHandle;
}