import { describe, expect, it } from "vitest";

import {
  BitCrushDistortionDefinitionSpecification,
  BitDepthSpecification,
  DistortionAudioSampleSpecification,
  DistortionCurveKind,
  DistortionDefinitionSpecification,
  DistortionDefinitionValidator,
  DistortionKind,
  DistortionMixSpecification,
  DistortionSampleRateHzSpecification,
  HardClipDistortionDefinitionSpecification,
  SampleRateReductionSpecification,
  type DistortionDefinition,
  type IDistortion,
  type IDistortionFactory,
  type IDistortionProcessRequest,
  type IDistortionProcessResult,
  type IDistortionStateSnapshot,
  type IHardClipDistortionDefinition,
  type ISoftClipDistortionDefinition,
} from "../src/index.js";

class DistortionContractsFixture {
  public createHardClipDefinition(): IHardClipDistortionDefinition {
    return {
      kind: DistortionKind.HardClip,
      inputGain: 2,
      outputGain: 0.8,
      mix: 1,
      threshold: 0.6,
    };
  }

  public createSoftClipDefinition(): ISoftClipDistortionDefinition {
    return {
      kind: DistortionKind.SoftClip,
      inputGain: 1.5,
      outputGain: 0.9,
      mix: 0.75,
      amount: 0.5,
      curve: DistortionCurveKind.Tanh,
    };
  }

  public createBitCrushDefinition(): DistortionDefinition {
    return {
      kind: DistortionKind.BitCrush,
      inputGain: 1,
      outputGain: 1,
      mix: 0.5,
      bitDepth: 8,
      sampleRateReduction: 4,
    };
  }
}

class TestDistortion implements IDistortion {
  private lastInput = 0;
  private lastOutput = 0;

  public constructor(public readonly definition: DistortionDefinition) {}

  public process(request: IDistortionProcessRequest): IDistortionProcessResult {
    this.lastInput = request.input;

    const wet =
      this.definition.kind === DistortionKind.Bypass
        ? request.input
        : Math.max(-1, Math.min(1, request.input * this.definition.inputGain));

    const dry = request.input;
    const output = dry * (1 - this.definition.mix) + wet * this.definition.mix;

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
  }
}

class TestDistortionFactory implements IDistortionFactory {
  public create(definition: DistortionDefinition): IDistortion {
    DistortionDefinitionValidator.createDefault().validate(definition);

    return new TestDistortion(definition);
  }
}

describe("music-core-synthesizer-distortion-contracts", () => {
  describe("constants", () => {
    it("should expose stable distortion kind values", () => {
      expect(DistortionKind.Bypass).toBe("bypass");
      expect(DistortionKind.HardClip).toBe("hard-clip");
      expect(DistortionKind.SoftClip).toBe("soft-clip");
      expect(DistortionKind.Tanh).toBe("tanh");
      expect(DistortionKind.Foldback).toBe("foldback");
      expect(DistortionKind.BitCrush).toBe("bit-crush");
    });

    it("should expose stable distortion curve kind values", () => {
      expect(DistortionCurveKind.Linear).toBe("linear");
      expect(DistortionCurveKind.Cubic).toBe("cubic");
      expect(DistortionCurveKind.Arctangent).toBe("arctangent");
      expect(DistortionCurveKind.Tanh).toBe("tanh");
    });
  });

  describe("parameter specifications", () => {
    it("should validate distortion mix as unipolar normalized value", () => {
      const specification = DistortionMixSpecification.zeroToOne();

      expect(specification.isSatisfiedBy(0)).toBe(true);
      expect(specification.isSatisfiedBy(0.5)).toBe(true);
      expect(specification.isSatisfiedBy(1)).toBe(true);
      expect(specification.isSatisfiedBy(1.1)).toBe(false);
    });

    it("should validate audio samples as bipolar normalized values", () => {
      const specification = DistortionAudioSampleSpecification.minusOneToOne();

      expect(specification.isSatisfiedBy(-1)).toBe(true);
      expect(specification.isSatisfiedBy(0)).toBe(true);
      expect(specification.isSatisfiedBy(1)).toBe(true);
      expect(specification.isSatisfiedBy(-1.1)).toBe(false);
    });

    it("should validate sample rate as positive frequency value", () => {
      const specification = DistortionSampleRateHzSpecification.positiveFinite();

      expect(specification.isSatisfiedBy(48_000)).toBe(true);
      expect(specification.isSatisfiedBy(0)).toBe(false);
    });

    it("should validate bit depth and sample rate reduction", () => {
      expect(BitDepthSpecification.standardRange().isSatisfiedBy(8)).toBe(true);
      expect(BitDepthSpecification.standardRange().isSatisfiedBy(0)).toBe(false);

      expect(SampleRateReductionSpecification.standardRange().isSatisfiedBy(4)).toBe(true);
      expect(SampleRateReductionSpecification.standardRange().isSatisfiedBy(0)).toBe(false);
    });
  });

  describe("definition specifications", () => {
    it("should validate hard clip definitions", () => {
      const fixture = new DistortionContractsFixture();

      expect(
        new HardClipDistortionDefinitionSpecification().isSatisfiedBy(
          fixture.createHardClipDefinition(),
        ),
      ).toBe(true);
    });

    it("should validate bit crush definitions", () => {
      const fixture = new DistortionContractsFixture();

      expect(
        new BitCrushDistortionDefinitionSpecification().isSatisfiedBy(
          fixture.createBitCrushDefinition(),
        ),
      ).toBe(true);
    });

    it("should reject invalid shared parameter values", () => {
      const fixture = new DistortionContractsFixture();
      const invalid = {
        ...fixture.createHardClipDefinition(),
        mix: 2,
      };

      expect(
        new HardClipDistortionDefinitionSpecification().isSatisfiedBy(invalid),
      ).toBe(false);
    });

    it("should validate the discriminated distortion union", () => {
      const fixture = new DistortionContractsFixture();
      const specification = DistortionDefinitionSpecification.valid();

      expect(specification.isSatisfiedBy(fixture.createHardClipDefinition())).toBe(true);
      expect(specification.isSatisfiedBy(fixture.createSoftClipDefinition())).toBe(true);
      expect(specification.isSatisfiedBy(fixture.createBitCrushDefinition())).toBe(true);
    });
  });

  describe("validator", () => {
    it("should allow valid distortion definitions", () => {
      const fixture = new DistortionContractsFixture();
      const validator = DistortionDefinitionValidator.createDefault();

      expect(() => validator.validate(fixture.createHardClipDefinition())).not.toThrow();
    });

    it("should reject invalid distortion definitions", () => {
      const fixture = new DistortionContractsFixture();
      const validator = DistortionDefinitionValidator.createDefault();

      const invalid = {
        ...fixture.createHardClipDefinition(),
        threshold: 2,
      };

      expect(() => validator.validate(invalid)).toThrow(
        "Distortion definition is invalid",
      );
    });
  });

  describe("runtime contracts", () => {
    it("should allow a distortion implementation to follow the contract", () => {
      const fixture = new DistortionContractsFixture();
      const distortion = new TestDistortion(fixture.createHardClipDefinition());

      const result = distortion.process({
        input: 0.5,
        sampleRateHz: 48_000,
      });

      expect(result.input).toBe(0.5);
      expect(result.dry).toBe(0.5);
      expect(result.wet).toBe(1);
      expect(result.output).toBe(1);
      expect(distortion.snapshot().lastInput).toBe(0.5);
      expect(distortion.snapshot().lastOutput).toBe(1);

      distortion.reset();

      expect(distortion.snapshot().lastInput).toBe(0);
      expect(distortion.snapshot().lastOutput).toBe(0);
    });

    it("should allow a distortion factory implementation to create distortion units", () => {
      const fixture = new DistortionContractsFixture();
      const factory = new TestDistortionFactory();

      const distortion = factory.create(fixture.createSoftClipDefinition());

      expect(distortion.definition.kind).toBe(DistortionKind.SoftClip);
    });
  });
});
