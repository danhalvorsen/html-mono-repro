import type {
  DistortionDefinition,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

export type WebAudioOversampleValue = "none" | "2x" | "4x";

export interface IWebAudioConnectable {
  connect(destination: IWebAudioConnectable): unknown;
  disconnect(): void;
}

export interface IWebAudioAudioParamLike {
  value: number;
}

export interface IWebAudioGainNodeLike extends IWebAudioConnectable {
  readonly gain: IWebAudioAudioParamLike;
}

export interface IWebAudioWaveShaperNodeLike extends IWebAudioConnectable {
  curve: Float32Array | null;
  oversample: WebAudioOversampleValue;
}

export interface IWebAudioContextLike {
  readonly sampleRate: number;

  createGain(): IWebAudioGainNodeLike;

  createWaveShaper(): IWebAudioWaveShaperNodeLike;
}

export interface IWebAudioDistortionGraph {
  readonly definition: DistortionDefinition;
  readonly inputNode: IWebAudioConnectable;
  readonly outputNode: IWebAudioConnectable;

  update(definition: DistortionDefinition): void;

  connect(destination: IWebAudioConnectable): void;

  disconnect(): void;
}

export interface IWebAudioDistortionGraphFactory {
  create(definition: DistortionDefinition): IWebAudioDistortionGraph;
}
