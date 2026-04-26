import type {
  EnvelopeDefinition,
  IEnvelopeGateOffRequest,
  IEnvelopeGateOnRequest,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

export interface IWebAudioConnectable {
  connect(destination: IWebAudioConnectable): unknown;
  disconnect(): void;
}

export interface IWebAudioAudioParamLike {
  value: number;

  cancelScheduledValues(startTime: number): void;

  setValueAtTime(value: number, startTime: number): void;

  linearRampToValueAtTime(value: number, endTime: number): void;

  setTargetAtTime(
    target: number,
    startTime: number,
    timeConstant: number,
  ): void;
}

export interface IWebAudioGainNodeLike extends IWebAudioConnectable {
  readonly gain: IWebAudioAudioParamLike;
}

export interface IWebAudioContextLike {
  readonly sampleRate: number;

  createGain(): IWebAudioGainNodeLike;
}

export interface IWebAudioEnvelopeAutomation {
  readonly definition: EnvelopeDefinition;

  gateOn(request: IEnvelopeGateOnRequest): void;

  gateOff(request: IEnvelopeGateOffRequest): void;

  reset(timeSeconds: number): void;

  update(definition: EnvelopeDefinition): void;
}

export interface IWebAudioEnvelopeGainGraph extends IWebAudioEnvelopeAutomation {
  readonly inputNode: IWebAudioConnectable;
  readonly outputNode: IWebAudioConnectable;

  connect(destination: IWebAudioConnectable): void;

  disconnect(): void;
}

export interface IWebAudioEnvelopeGainGraphFactory {
  create(definition: EnvelopeDefinition): IWebAudioEnvelopeGainGraph;
}
