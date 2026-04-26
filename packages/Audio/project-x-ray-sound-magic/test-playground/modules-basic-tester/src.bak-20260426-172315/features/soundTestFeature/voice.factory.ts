// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/voice.factory.ts

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import {
  OscillatorWaveform,
  FilterType,
  DistortionType,
} from "@monorepo/music-core-synthesizer-contracts";

import { AdsrEnvelope} from "@monorepo/music-core-synthesizer-envelopes";                   

// 2) voice.factory.ts

export function createDefaultVoiceDefinition(): IVoiceDefinition {
  return {
    oscillators: [
      {
        waveform: OscillatorWaveform.Sawtooth,
        detuneCents: 0,
        gain: 0.8,
      },
    ],
    noise: {
      enabled: false,
      gain: 0,
    },
    envelope: AdsrEnvelope.create({
      attackSeconds: 0.01,
      decaySeconds: 0.1,
      sustainLevel: 0.7,
      releaseSeconds: 0.25,
    }),
    filter: {
      enabled: false,
      type: FilterType.LowPass,
      cutoffHz: 2000,
      resonanceQ: 0.7,
    },
    distortion: {
      enabled: false,
      type: DistortionType.None,
      amount: 0,
    },
  };
}