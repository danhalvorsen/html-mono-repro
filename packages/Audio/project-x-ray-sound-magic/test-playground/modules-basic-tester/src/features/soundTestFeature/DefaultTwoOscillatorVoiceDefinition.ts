// FILE: src/features/soundTestFeature/DefaultTwoOscillatorVoiceDefinition.ts

import {
  EnvelopeCurveKind,
  EnvelopeKind,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";
import type { IBasicOscillatorDefinition } from "@monorepo/music-core-synthesizer-oscillators-contracts";
import {
  OscillatorKind,
  OscillatorWaveformKind,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import type { ITwoOscillatorVoiceDefinition } from "./TwoOscillatorVoice.js";

export class DefaultTwoOscillatorVoiceDefinitionFactory {
  public static create(): ITwoOscillatorVoiceDefinition {
    return {
      outputGain: 0.75,
      oscillators: [
        {
          enabled: true,
          definition: this.createBasicOscillator({
            waveform: OscillatorWaveformKind.Sawtooth,
            gain: 0.45,
            detuneCents: -7,
          }),
        },
        {
          enabled: true,
          definition: this.createBasicOscillator({
            waveform: OscillatorWaveformKind.Square,
            gain: 0.35,
            detuneCents: 7,
          }),
        },
      ],
      envelope: {
        kind: EnvelopeKind.Adsr,
        attackSeconds: 0.02,
        decaySeconds: 0.14,
        sustainLevel: 0.62,
        releaseSeconds: 0.35,
        attackCurve: { kind: EnvelopeCurveKind.Linear },
        decayCurve: { kind: EnvelopeCurveKind.Linear },
        releaseCurve: { kind: EnvelopeCurveKind.Linear },
      },
    };
  }

  private static createBasicOscillator(request: {
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
}