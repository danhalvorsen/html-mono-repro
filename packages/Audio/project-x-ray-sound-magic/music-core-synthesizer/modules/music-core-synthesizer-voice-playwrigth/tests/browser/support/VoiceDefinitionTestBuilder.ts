import {
  EnvelopeCurveKind,
  EnvelopeKind,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

import type {
  IVoiceDefinition,
  IVoiceLayerDefinition,
} from "@monorepo/music-core-synthesizer-voice-contracts";

import { BasicOscillatorDefinitionFactory } from "./BasicOscillatorDefinitionFactory.js";

export class VoiceDefinitionTestBuilder {
  private id = "test-voice";
  private outputGain = 1;
  private frequenciesHz: readonly number[] = [440];

  public withId(id: string): this {
    this.id = id;
    return this;
  }

  public withOutputGain(outputGain: number): this {
    this.outputGain = outputGain;
    return this;
  }

  public withOscillatorFrequencies(
    frequenciesHz: readonly number[],
  ): this {
    this.frequenciesHz = frequenciesHz;
    return this;
  }

  public build(): IVoiceDefinition {
    return {
      id: this.id,
      outputGain: this.outputGain,
      layers: [
        this.createLayer(),
      ],
    };
  }

  private createLayer(): IVoiceLayerDefinition {
    return {
      id: "main-layer",
      enabled: true,
      gain: 1,
      oscillators: this.frequenciesHz.map((frequencyHz) =>
        BasicOscillatorDefinitionFactory.create({ frequencyHz }),
      ),
      envelope: {
        kind: EnvelopeKind.Adsr,
        attackSeconds: 0.01,
        decaySeconds: 0.1,
        sustainLevel: 0.8,
        releaseSeconds: 0.1,
        attackCurve: { kind: EnvelopeCurveKind.Linear },
        decayCurve: { kind: EnvelopeCurveKind.Exponential },
        releaseCurve: { kind: EnvelopeCurveKind.Exponential },
      },
    };
  }
}
