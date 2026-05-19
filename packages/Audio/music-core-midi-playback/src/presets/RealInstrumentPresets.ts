import { EnvelopeADSR } from "../value-objects/EnvelopeADSR.js";
import { FilterSettings } from "../value-objects/FilterSettings.js";
import { FilterType } from "../value-objects/FilterType.js";
import { WebAudioSynthConfiguration } from "../web-audio/WebAudioSynthConfiguration.js";

export const RealInstrumentPresets = {
  analogBrass: WebAudioSynthConfiguration.create({
    envelope: EnvelopeADSR.create(0.01, 0.14, 0.62, 0.24),
    filter: FilterSettings.create(FilterType.LowPass, 2100, 1.9),
    filterEnvelope: EnvelopeADSR.create(0.012, 0.2, 0.58, 0.3),
    noteLengthSeconds: 0.24,
    detuneCents: 11,
    filterEnvAmount: 1.7,
    velocityToFilter: 0.62,
    subLevel: 0.12,
    panSpread: 0.16,
  }),

  electricPiano: WebAudioSynthConfiguration.create({
    envelope: EnvelopeADSR.create(0.002, 0.32, 0.15, 0.35),
    filter: FilterSettings.create(FilterType.LowPass, 2900, 0.9),
    filterEnvelope: EnvelopeADSR.create(0.004, 0.25, 0.4, 0.35),
    noteLengthSeconds: 0.22,
    detuneCents: 4,
    filterEnvAmount: 1.25,
    velocityToFilter: 0.7,
    subLevel: 0.05,
    panSpread: 0.08,
  }),

  warmPad: WebAudioSynthConfiguration.create({
    envelope: EnvelopeADSR.create(0.12, 0.35, 0.75, 0.55),
    filter: FilterSettings.create(FilterType.LowPass, 1600, 0.7),
    filterEnvelope: EnvelopeADSR.create(0.18, 0.5, 0.68, 0.6),
    noteLengthSeconds: 0.4,
    detuneCents: 7,
    filterEnvAmount: 1.2,
    velocityToFilter: 0.3,
    subLevel: 0.18,
    panSpread: 0.2,
  }),

  synthPluck: WebAudioSynthConfiguration.create({
    envelope: EnvelopeADSR.create(0.001, 0.1, 0.05, 0.12),
    filter: FilterSettings.create(FilterType.LowPass, 3200, 1.3),
    filterEnvelope: EnvelopeADSR.create(0.002, 0.09, 0.15, 0.12),
    noteLengthSeconds: 0.17,
    detuneCents: 3,
    filterEnvAmount: 1.4,
    velocityToFilter: 0.8,
    subLevel: 0.04,
    panSpread: 0.06,
  }),

  drumVoice: WebAudioSynthConfiguration.create({
    envelope: EnvelopeADSR.create(0.004, 0.09, 0.02, 0.08),
    filter: FilterSettings.create(FilterType.LowPass, 1400, 0.75),
    filterEnvelope: EnvelopeADSR.create(0.003, 0.06, 0.22, 0.08),
    noteLengthSeconds: 0.1,
    detuneCents: 0,
    oscBLevel: 0,
    filterEnvAmount: 1.35,
    velocityToFilter: 0.1,
    subLevel: 0,
    panSpread: 0,
  }),
} as const;
