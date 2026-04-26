import type {
  OscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

export type WebAudioOscillatorTypeValue =
  | "sine"
  | "square"
  | "sawtooth"
  | "triangle";

export interface IWebAudioConnectable {
  connect(destination: IWebAudioConnectable): unknown;
  disconnect(): void;
}

export interface IWebAudioAudioParamLike {
  value: number;

  setValueAtTime(value: number, startTime: number): void;
}

export interface IWebAudioGainNodeLike extends IWebAudioConnectable {
  readonly gain: IWebAudioAudioParamLike;
}

export interface IWebAudioPeriodicWaveLike {
  readonly id: string;
}

export interface IWebAudioAudioBufferLike {
  readonly id: string;
}

export interface IWebAudioSourceNodeLike extends IWebAudioConnectable {
  start(when: number): void;
  stop(when: number): void;
}

export interface IWebAudioOscillatorNodeLike extends IWebAudioSourceNodeLike {
  type: WebAudioOscillatorTypeValue;
  readonly frequency: IWebAudioAudioParamLike;
  readonly detune: IWebAudioAudioParamLike;

  setPeriodicWave(periodicWave: IWebAudioPeriodicWaveLike): void;
}

export interface IWebAudioBufferSourceNodeLike extends IWebAudioSourceNodeLike {
  buffer: IWebAudioAudioBufferLike | null;
  loop: boolean;
  readonly playbackRate: IWebAudioAudioParamLike;
}

export interface IWebAudioContextLike {
  readonly sampleRate: number;

  createGain(): IWebAudioGainNodeLike;

  createOscillator(): IWebAudioOscillatorNodeLike;

  createBufferSource(): IWebAudioBufferSourceNodeLike;
}

export interface IWebAudioWavetableProvider {
  get(tableId: string): IWebAudioPeriodicWaveLike;
}

export interface IWebAudioSampleBufferProvider {
  get(sampleId: string): IWebAudioAudioBufferLike;
}

export interface IWebAudioOscillatorGraph {
  readonly definition: OscillatorDefinition;
  readonly outputNode: IWebAudioConnectable;

  noteOn(request: {
    readonly timeSeconds: number;
    readonly frequencyHz: number;
    readonly velocity: number;
  }): void;

  noteOff(request: {
    readonly timeSeconds: number;
  }): void;

  connect(destination: IWebAudioConnectable): void;

  disconnect(): void;

  reset(): void;
}

export interface IWebAudioOscillatorGraphFactory {
  create(definition: OscillatorDefinition): IWebAudioOscillatorGraph;
}
