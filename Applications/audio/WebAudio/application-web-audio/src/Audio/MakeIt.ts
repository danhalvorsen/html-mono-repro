import type { OscillatorModel } from "../lit3/WebComponents/OscillatorControl/OscillatorModel.js";

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

export interface IAudioNodeFactory {
  createOscillator(config: IOscillatorConfig): OscillatorNode;
  createGain(config: IGainConfig): GainNode;
  createMixer(config: IMixerConfig): GainNode;
}

export interface ISynthBuilder {
  addOscillator(model: OscillatorModel): ISynthBuilder;
  withMixerLevel(value: number): ISynthBuilder;
  build(): ISynthesizer;
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
