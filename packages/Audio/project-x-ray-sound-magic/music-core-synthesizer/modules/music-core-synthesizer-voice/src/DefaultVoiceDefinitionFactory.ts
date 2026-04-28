import {
  EnvelopeCurveKind,
  EnvelopeKind,
  type IAdsrEnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

import {
  OscillatorKind,
  OscillatorWaveformKind,
  type OscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import type {
  IVoiceDefinition,
  IVoiceLayerDefinition,
} from "@monorepo/music-core-synthesizer-voice-contracts";

export interface IDefaultVoiceDefinitionFactory {
  create(): IVoiceDefinition;
}

export class DefaultVoiceDefinitionFactory implements IDefaultVoiceDefinitionFactory {
  public create(): IVoiceDefinition {
    return {
      id: "default-voice",
      outputGain: 0.8,
      layers: [
        this.createLayer({
          id: "main-layer",
          gain: 1,
          enabled: true,
          oscillatorFrequencyHz: 440,
        }),
      ],
    };
  }

  private createLayer(request: {
    readonly id: string;
    readonly gain: number;
    readonly enabled: boolean;
    readonly oscillatorFrequencyHz: number;
  }): IVoiceLayerDefinition {
    return {
      id: request.id,
      enabled: request.enabled,
      gain: request.gain,
      oscillators: [
        this.createOscillator({
          frequencyHz: request.oscillatorFrequencyHz,
          detuneCents: 0,
        }),
      ],
      envelope: this.createEnvelope(),
    };
  }

  private createOscillator(request: {
    readonly frequencyHz: number;
    readonly detuneCents: number;
  }): OscillatorDefinition {
    return {
      kind: OscillatorKind.Basic,
      waveform: OscillatorWaveformKind.Sawtooth,
      frequencyHz: request.frequencyHz,
      detuneCents: request.detuneCents,
      phaseRadians: 0,
      gain: 1,
    };
  }

  private createEnvelope(): IAdsrEnvelopeDefinition {
    return {
      kind: EnvelopeKind.Adsr,
      attackSeconds: 0.01,
      decaySeconds: 0.12,
      sustainLevel: 0.7,
      releaseSeconds: 0.25,
      attackCurve: { kind: EnvelopeCurveKind.Linear },
      decayCurve: { kind: EnvelopeCurveKind.Exponential },
      releaseCurve: { kind: EnvelopeCurveKind.Exponential },
    };
  }
}
