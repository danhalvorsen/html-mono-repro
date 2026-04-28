import {
  OscillatorKind,
  type IBasicOscillatorDefinition,
  type OscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

export class BasicOscillatorDefinitionGuard {
  public static require(
    definition: OscillatorDefinition,
  ): IBasicOscillatorDefinition {
    if (definition.kind !== OscillatorKind.Basic) {
      throw new Error(`Expected a basic oscillator definition. Actual kind: ${definition.kind}.`);
    }

    return definition;
  }
}
