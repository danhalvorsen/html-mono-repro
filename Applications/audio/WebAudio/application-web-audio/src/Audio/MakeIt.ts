// Applications/audio/WebAudio/application-web-audio/src/Audio/MakeIt.ts
// BREAKING CHANGES ONLY

import { DefaultAudioNodeFactory } from "./DefaultAudioNodeFactory";
import { PresetSynthFactory } from "./PresetSynthFactory";

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

export interface IVoiceConfig {
  readonly oscillator: IOscillatorConfig;
  readonly gain: number;
}

export interface IGainConfig {
  readonly gain: number;
}

export interface IMixerConfig {
  readonly level: number;
}

export interface ISimpleSynthConfig {
  readonly voices: readonly IVoiceConfig[];
  readonly mixer: IMixerConfig;
}

export interface IAudioNodeFactory {
  createOscillator(config: IOscillatorConfig): OscillatorNode;
  createGain(config: IGainConfig): GainNode;
  createMixer(config: IMixerConfig): GainNode;
}

export interface ISynthBuilder {
  addOscillator(
    type: OscillatorType,
    frequency: number,
    detune?: number,
    gain?: number,
  ): ISynthBuilder;

  withMixerLevel(value: number): ISynthBuilder;
  build(): ISynthesizer;
}

export interface ISynthFactory {
  createDefault(): ISynthesizer;
  createLead(): ISynthesizer;
  createBass(): ISynthesizer;
}

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

export function createSynthFactory(context: AudioContext): ISynthFactory {
  const nodeFactory = new DefaultAudioNodeFactory(context);
  return new PresetSynthFactory(nodeFactory);
}