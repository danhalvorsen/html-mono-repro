import {
  EnvelopeCurveKind,
  EnvelopeKind,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";
import type {
  IAdsrEnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";
import {
  OscillatorKind,
  OscillatorWaveformKind,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";
import type {
  IBasicOscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";
import type {
  IVoiceDefinition,
  IVoiceLayerDefinition,
} from "@monorepo/music-core-synthesizer-voice-contracts";

export class DefaultVoiceDefinitionFactory {
  public static createTwoLayerDefault(): IVoiceDefinition {
    return {
      outputGain: 0.75,
      layers: [
        this.createLayer({
          waveform: OscillatorWaveformKind.Sawtooth,
          oscillatorGain: 0.45,
          detuneCents: -7,
          layerGain: 0.9,
        }),
        this.createLayer({
          waveform: OscillatorWaveformKind.Square,
          oscillatorGain: 0.35,
          detuneCents: 7,
          layerGain: 0.8,
        }),
      ],
    };
  }

  private static createLayer(request: {
    readonly waveform: IBasicOscillatorDefinition["waveform"];
    readonly oscillatorGain: number;
    readonly detuneCents: number;
    readonly layerGain: number;
  }): IVoiceLayerDefinition {
    return {
      enabled: true,
      gain: request.layerGain,
      oscillator: this.createOscillator({
        waveform: request.waveform,
        gain: request.oscillatorGain,
        detuneCents: request.detuneCents,
      }),
      envelope: this.createAdsrEnvelope(),
    };
  }

  private static createOscillator(request: {
    readonly waveform: IBasicOscillatorDefinition["waveform"];
    readonly gain: number;
    readonly detuneCents: number;
  }): IBasicOscillatorDefinition {
    return {
      kind: OscillatorKind.Basic,
      waveform: request.waveform,
      frequencyHz: 440,
      detuneCents: request.detuneCents,
      phaseRadians: 0,
      gain: request.gain,
    };
  }

  private static createAdsrEnvelope(): IAdsrEnvelopeDefinition {
    return {
      kind: EnvelopeKind.Adsr,
      attackSeconds: 0.02,
      decaySeconds: 0.14,
      sustainLevel: 0.62,
      releaseSeconds: 0.35,
      attackCurve: { kind: EnvelopeCurveKind.Linear },
      decayCurve: { kind: EnvelopeCurveKind.Linear },
      releaseCurve: { kind: EnvelopeCurveKind.Linear },
    };
  }
}
