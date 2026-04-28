import type {
  IBasicOscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import type {
  IVoiceDefinition,
} from "@monorepo/music-core-synthesizer-voice-contracts";

import { BasicOscillatorDefinitionGuard } from "./BasicOscillatorDefinitionGuard.js";

export class VoiceDefinitionFlattener {
  public static getBasicOscillators(
    definition: IVoiceDefinition,
  ): readonly IBasicOscillatorDefinition[] {
    return definition.layers
      .filter((layer) => layer.enabled)
      .flatMap((layer) => layer.oscillators)
      .map((oscillator) => BasicOscillatorDefinitionGuard.require(oscillator));
  }
}
