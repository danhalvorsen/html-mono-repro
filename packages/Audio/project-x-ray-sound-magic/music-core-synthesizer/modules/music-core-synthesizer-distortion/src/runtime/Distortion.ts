import {
  DistortionAudioSampleSpecification,
  DistortionDefinitionValidator,
  DistortionKind,
  DistortionSampleRateHzSpecification,
  type DistortionAudioSampleValue,
  type DistortionDefinition,
  type IDistortion,
  type IDistortionProcessRequest,
  type IDistortionProcessResult,
  type IDistortionStateSnapshot,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

import type { IDistortionAlgorithm } from "../algorithms/index.js";
import { DistortionMath } from "../math/index.js";

export class Distortion implements IDistortion {
  private lastInput: DistortionAudioSampleValue = 0;
  private lastOutput: DistortionAudioSampleValue = 0;

  private readonly audioSampleSpecification =
    DistortionAudioSampleSpecification.minusOneToOne();

  private readonly sampleRateSpecification =
    DistortionSampleRateHzSpecification.positiveFinite();

  public constructor(
    public readonly definition: DistortionDefinition,
    private readonly algorithm: IDistortionAlgorithm,
    private readonly definitionValidator: DistortionDefinitionValidator,
  ) {
    this.definitionValidator.validate(definition);
  }

  public process(request: IDistortionProcessRequest): IDistortionProcessResult {
    this.assertInput(request.input);
    this.assertSampleRate(request.sampleRateHz);

    this.lastInput = request.input;

    const dry = request.input;
    const driven = DistortionMath.clampBipolar(request.input * this.definition.inputGain);
    const wetRaw = this.algorithm.process(driven, this.definition, request.sampleRateHz);
    const wet = DistortionMath.clampBipolar(wetRaw * this.definition.outputGain);
    const output = DistortionMath.mix(dry, wet, this.definition.mix);

    this.lastOutput = output;

    return {
      input: request.input,
      output,
      wet,
      dry,
    };
  }

  public snapshot(): IDistortionStateSnapshot {
    return {
      definition: this.definition,
      lastInput: this.lastInput,
      lastOutput: this.lastOutput,
      isBypassed: this.definition.kind === DistortionKind.Bypass,
    };
  }

  public reset(): void {
    this.lastInput = 0;
    this.lastOutput = 0;
    this.algorithm.reset();
  }

  private assertInput(input: DistortionAudioSampleValue): void {
    if (!this.audioSampleSpecification.isSatisfiedBy(input)) {
      throw new Error(`input must be between -1 and 1. Actual value: ${String(input)}.`);
    }
  }

  private assertSampleRate(sampleRateHz: number): void {
    if (!this.sampleRateSpecification.isSatisfiedBy(sampleRateHz)) {
      throw new Error(`sampleRateHz must be finite and greater than 0. Actual value: ${String(sampleRateHz)}.`);
    }
  }
}
