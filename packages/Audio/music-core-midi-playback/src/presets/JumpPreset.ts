import { EnvelopeADSR } from "../value-objects/EnvelopeADSR.js";
import { FilterSettings } from "../value-objects/FilterSettings.js";
import { FilterType } from "../value-objects/FilterType.js";
import { WebAudioSynthConfiguration } from "../web-audio/WebAudioSynthConfiguration.js";

export const JumpPreset = WebAudioSynthConfiguration.create({
  envelope: EnvelopeADSR.create(0.008, 0.11, 0.58, 0.23),
  filter: FilterSettings.create(FilterType.LowPass, 2200, 1.7),
  filterEnvelope: EnvelopeADSR.create(0.01, 0.16, 0.62, 0.28),
  noteLengthSeconds: 0.24,
  detuneCents: 10,
  filterEnvAmount: 1.55,
  velocityToFilter: 0.55,
  subLevel: 0.12,
  panSpread: 0.15,
});
