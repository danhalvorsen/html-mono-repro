import {
  OscillatorKind,
  OscillatorWaveformKind,
  type IBasicOscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

export interface ICreateBasicOscillatorRequest {
  readonly frequencyHz: number;
  readonly detuneCents?: number;
  readonly gain?: number;
}

export class BasicOscillatorDefinitionFactory {
  public static create(
    request: ICreateBasicOscillatorRequest,
  ): IBasicOscillatorDefinition {
    return {
      kind: OscillatorKind.Basic,
      waveform: OscillatorWaveformKind.Sine,
      frequencyHz: request.frequencyHz,
      detuneCents: request.detuneCents ?? 0,
      phaseRadians: 0,
      gain: request.gain ?? 1,
    };
  }
}
