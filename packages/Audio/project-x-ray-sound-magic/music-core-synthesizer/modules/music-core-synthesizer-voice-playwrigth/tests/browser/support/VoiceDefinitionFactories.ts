import type {
  IVoiceDefinition,
} from "@monorepo/music-core-synthesizer-voice-contracts";

import { AdsrEnvelopeDefinitionTestFactory } from "./AdsrEnvelopeDefinitionTestFactory.js";
import { BasicOscillatorDefinitionFactory } from "./BasicOscillatorDefinitionFactory.js";

export const VoiceFrequencyHz = {
  C4: 261.63,
  E4: 329.63,
  G4: 392,
} as const;

export class DefaultThreeOscillatorVoiceDefinitionFactory {
  public static create(): IVoiceDefinition {
    return {
      id: "three-oscillator-voice",
      outputGain: 1,
      layers: [
        {
          id: "main-layer",
          enabled: true,
          gain: 1,
          oscillators: [
            BasicOscillatorDefinitionFactory.create({
              frequencyHz: VoiceFrequencyHz.C4,
            }),
            BasicOscillatorDefinitionFactory.create({
              frequencyHz: VoiceFrequencyHz.E4,
            }),
            BasicOscillatorDefinitionFactory.create({
              frequencyHz: VoiceFrequencyHz.G4,
            }),
          ],
          envelope: AdsrEnvelopeDefinitionTestFactory.createDefault(),
        },
      ],
    };
  }
}

export class DefaultTwoOscillatorTwoAdsrVoiceDefinitionFactory {
  public static create(): IVoiceDefinition {
    return {
      id: "two-osc-two-adsrs-voice",
      outputGain: 1,
      layers: [
        {
          id: "oscillator-1-layer",
          enabled: true,
          gain: 1,
          oscillators: [
            BasicOscillatorDefinitionFactory.create({
              frequencyHz: VoiceFrequencyHz.C4,
            }),
          ],
          envelope: AdsrEnvelopeDefinitionTestFactory.createFast(),
        },
        {
          id: "oscillator-2-layer",
          enabled: true,
          gain: 1,
          oscillators: [
            BasicOscillatorDefinitionFactory.create({
              frequencyHz: VoiceFrequencyHz.G4,
            }),
          ],
          envelope: AdsrEnvelopeDefinitionTestFactory.createSlow(),
        },
      ],
    };
  }
}
