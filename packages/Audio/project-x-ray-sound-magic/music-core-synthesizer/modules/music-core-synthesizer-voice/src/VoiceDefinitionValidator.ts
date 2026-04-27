import type {
  IVoiceDefinition,
  IVoiceLayerDefinition,
} from "@monorepo/music-core-synthesizer-voice-contracts";

export interface IVoiceDefinitionValidator {
  validate(definition: IVoiceDefinition): void;
}

export class VoiceDefinitionValidator implements IVoiceDefinitionValidator {
  public validate(definition: IVoiceDefinition): void {
    this.assertUnitInterval("outputGain", definition.outputGain);

    if (definition.layers.length === 0) {
      throw new Error("Voice definition requires at least one layer.");
    }

    definition.layers.forEach((layer, index) => this.validateLayer(layer, index));
  }

  private validateLayer(
    layer: IVoiceLayerDefinition,
    index: number,
  ): void {
    this.assertUnitInterval(`layers[${index}].gain`, layer.gain);

    if (typeof layer.enabled !== "boolean") {
      throw new Error(`layers[${index}].enabled must be boolean.`);
    }
  }

  private assertUnitInterval(
    name: string,
    value: number,
  ): void {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`${name} must be between 0 and 1. Actual value: ${String(value)}.`);
    }
  }
}
