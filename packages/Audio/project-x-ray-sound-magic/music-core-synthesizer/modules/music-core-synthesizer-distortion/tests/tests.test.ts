import { describe, expect, it } from "vitest";

import {
  DistortionCurveKind,
  DistortionKind,
  type IBitCrushDistortionDefinition,
  type IBypassDistortionDefinition,
  type IHardClipDistortionDefinition,
  type ISoftClipDistortionDefinition,
  type ITanhDistortionDefinition,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

import {
  BitCrushDistortionAlgorithm,
  DistortionFactory,
  DistortionMath,
  FoldbackDistortionAlgorithm,
  HardClipDistortionAlgorithm,
  SoftClipDistortionAlgorithm,
  TanhDistortionAlgorithm,
} from "../src/index.js";

class DistortionFixture {
  public createBypassDefinition(): IBypassDistortionDefinition {
    return {
      kind: DistortionKind.Bypass,
      inputGain: 1,
      outputGain: 1,
      mix: 1,
    };
  }

  public createHardClipDefinition(): IHardClipDistortionDefinition {
    return {
      kind: DistortionKind.HardClip,
      inputGain: 2,
      outputGain: 1,
      mix: 1,
      threshold: 0.6,
    };
  }

  public createSoftClipDefinition(): ISoftClipDistortionDefinition {
    return {
      kind: DistortionKind.SoftClip,
      inputGain: 1,
      outputGain: 1,
      mix: 1,
      amount: 0.75,
      curve: DistortionCurveKind.Tanh,
    };
  }

  public createTanhDefinition(): ITanhDistortionDefinition {
    return {
      kind: DistortionKind.Tanh,
      inputGain: 1,
      outputGain: 1,
      mix: 1,
      amount: 1,
    };
  }

  public createBitCrushDefinition(): IBitCrushDistortionDefinition {
    return {
      kind: DistortionKind.BitCrush,
      inputGain: 1,
      outputGain: 1,
      mix: 1,
      bitDepth: 4,
      sampleRateReduction: 2,
    };
  }

  public expectInBipolarRange(value: number): void {
    expect(value).toBeGreaterThanOrEqual(-1);
    expect(value).toBeLessThanOrEqual(1);
  }
}

describe("music-core-synthesizer-distortion", () => {
  describe("math", () => {
    it("should clamp bipolar values", () => {
      expect(DistortionMath.clampBipolar(-2)).toBe(-1);
      expect(DistortionMath.clampBipolar(0.25)).toBe(0.25);
      expect(DistortionMath.clampBipolar(2)).toBe(1);
    });

    it("should mix dry and wet signals", () => {
      expect(DistortionMath.mix(0, 1, 0)).toBe(0);
      expect(DistortionMath.mix(0, 1, 0.5)).toBe(0.5);
      expect(DistortionMath.mix(0, 1, 1)).toBe(1);
    });
  });

  describe("algorithms", () => {
    it("should hard clip signal by threshold", () => {
      const fixture = new DistortionFixture();
      const algorithm = new HardClipDistortionAlgorithm();

      expect(
        algorithm.process(1, fixture.createHardClipDefinition(), 48_000),
      ).toBe(0.6);

      expect(
        algorithm.process(-1, fixture.createHardClipDefinition(), 48_000),
      ).toBe(-0.6);
    });

    it("should soft clip signal into bipolar range", () => {
      const fixture = new DistortionFixture();
      const algorithm = new SoftClipDistortionAlgorithm();

      const output = algorithm.process(
        0.8,
        fixture.createSoftClipDefinition(),
        48_000,
      );

      fixture.expectInBipolarRange(output);
      expect(output).toBeGreaterThan(0);
    });

    it("should tanh saturate signal into bipolar range", () => {
      const fixture = new DistortionFixture();
      const algorithm = new TanhDistortionAlgorithm();

      const output = algorithm.process(
        1,
        fixture.createTanhDefinition(),
        48_000,
      );

      fixture.expectInBipolarRange(output);
      expect(output).toBeGreaterThan(0.9);
    });

    it("should fold back signal exceeding threshold", () => {
      const algorithm = new FoldbackDistortionAlgorithm();

      const output = algorithm.process(
        1,
        {
          kind: DistortionKind.Foldback,
          inputGain: 1,
          outputGain: 1,
          mix: 1,
          threshold: 0.5,
        },
        48_000,
      );

      expect(output).toBe(0);
    });

    it("should bit crush and hold samples according to sample rate reduction", () => {
      const fixture = new DistortionFixture();
      const algorithm = new BitCrushDistortionAlgorithm();
      const definition = fixture.createBitCrushDefinition();

      const first = algorithm.process(0.2, definition, 48_000);
      const second = algorithm.process(0.8, definition, 48_000);
      const third = algorithm.process(0.8, definition, 48_000);

      expect(second).toBe(first);
      expect(third).not.toBe(first);
    });
  });

  describe("runtime", () => {
    it("should process bypass distortion without changing the signal", () => {
      const fixture = new DistortionFixture();
      const distortion = DistortionFactory.createDefault().create(
        fixture.createBypassDefinition(),
      );

      const result = distortion.process({
        input: 0.25,
        sampleRateHz: 48_000,
      });

      expect(result.output).toBe(0.25);
      expect(result.wet).toBe(0.25);
      expect(result.dry).toBe(0.25);
      expect(distortion.snapshot().isBypassed).toBe(true);
    });

    it("should process hard clip distortion through the contract runtime", () => {
      const fixture = new DistortionFixture();
      const distortion = DistortionFactory.createDefault().create(
        fixture.createHardClipDefinition(),
      );

      const result = distortion.process({
        input: 0.5,
        sampleRateHz: 48_000,
      });

      expect(result.input).toBe(0.5);
      expect(result.dry).toBe(0.5);
      expect(result.wet).toBe(0.6);
      expect(result.output).toBe(0.6);
      expect(distortion.snapshot().lastInput).toBe(0.5);
      expect(distortion.snapshot().lastOutput).toBe(0.6);
    });

    it("should reset runtime state", () => {
      const fixture = new DistortionFixture();
      const distortion = DistortionFactory.createDefault().create(
        fixture.createHardClipDefinition(),
      );

      distortion.process({
        input: 0.5,
        sampleRateHz: 48_000,
      });

      distortion.reset();

      expect(distortion.snapshot().lastInput).toBe(0);
      expect(distortion.snapshot().lastOutput).toBe(0);
    });

    it("should reject invalid definitions through the contract validator", () => {
      const fixture = new DistortionFixture();
      const invalid = {
        ...fixture.createHardClipDefinition(),
        threshold: 2,
      };

      expect(() =>
        DistortionFactory.createDefault().create(invalid),
      ).toThrow("Distortion definition is invalid");
    });

    it("should reject invalid process input", () => {
      const fixture = new DistortionFixture();
      const distortion = DistortionFactory.createDefault().create(
        fixture.createBypassDefinition(),
      );

      expect(() =>
        distortion.process({
          input: 2,
          sampleRateHz: 48_000,
        }),
      ).toThrow("input must be between -1 and 1");
    });
  });
});
