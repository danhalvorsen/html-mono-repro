// src/web-audio-builder-factory.ts

import { DefaultAudioNodeFactory } from "./DefaultAudioNodeFactory";
import { PresetSynthFactory } from "./PresetSynthFactory";

// ============================================================
// Contracts
// ============================================================

export interface IAudioComponent {
  connect(destination: AudioNode): void;
  disconnect(): void;
  dispose(): void;
}

export interface IStartable {
  start(when?: number): void;
  stop(when?: number): void;
}

export interface ISynthesizer extends IAudioComponent, IStartable {
  readonly output: AudioNode;
}

export interface IOscillatorConfig {
  readonly type: OscillatorType;
  readonly frequency: number;
  readonly detune: number;
}

export interface IGainConfig {
  readonly gain: number;
}

export interface IMixerConfig {
  readonly level: number;
}

export interface ISimpleSynthConfig {
  readonly oscillator: IOscillatorConfig;
  readonly voiceGain: IGainConfig;
  readonly mixer: IMixerConfig;
}

export interface IAudioNodeFactory {
  createOscillator(config: IOscillatorConfig): OscillatorNode;
  createGain(config: IGainConfig): GainNode;
  createMixer(config: IMixerConfig): GainNode;
}

export interface ISynthBuilder {
  withOscillatorType(type: OscillatorType): ISynthBuilder;
  withFrequency(value: number): ISynthBuilder;
  withDetune(value: number): ISynthBuilder;
  withVoiceGain(value: number): ISynthBuilder;
  withMixerLevel(value: number): ISynthBuilder;
  build(): ISynthesizer;
}

export interface ISynthFactory {
  createDefault(): ISynthesizer;
  createLead(): ISynthesizer;
  createBass(): ISynthesizer;
}

// ============================================================
// Guards
// ============================================================

export class Guard {
  public static positive(name: string, value: number): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(`${name} must be > 0`);
    }
  }

  public static gain(name: string, value: number): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`${name} must be >= 0`);
    }
  }
}

// ============================================================
// Composition root
// ============================================================

export function createSynthFactory(context: AudioContext): ISynthFactory {

  const nodeFactory = new DefaultAudioNodeFactory(context);

  return new PresetSynthFactory(nodeFactory);
}