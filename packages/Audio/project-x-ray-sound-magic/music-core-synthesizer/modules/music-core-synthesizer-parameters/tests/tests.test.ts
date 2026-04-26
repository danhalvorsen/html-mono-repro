import { describe, expect, it } from "vitest";

import {
  BipolarLinearParameterScale,
  BipolarNormalized,
  BipolarNormalizedSpecification,
  CentsToFrequencyRatioConverter,
  DecibelGainScale,
  Decibels,
  DecibelsToLinearGainConverter,
  DryWetMix,
  ExponentialParameterScale,
  FrequencyBandSpecification,
  FrequencyHz,
  FrequencyRatio,
  FrequencyRatioToCentsConverter,
  FrequencyRatioToSemitoneConverter,
  FrequencySpecification,
  LinearGain,
  LinearGainToDecibelsConverter,
  LinearParameterScale,
  LogarithmicFrequencyScale,
  ModulationAmount,
  ModulationDepth,
  Pan,
  ParameterMilliseconds,
  ParameterSamples,
  ParameterSeconds,
  Percentage,
  ResonanceQ,
  SampleRateHz,
  SecondsToMillisecondsConverter,
  SecondsToSamplesConverter,
  SemitoneToFrequencyRatioConverter,
  SteppedParameterScale,
  UnipolarNormalized,
  UnipolarNormalizedSpecification,
} from "../src/index.js";

class SynthesizerParametersFixture {
  public expectCloseTo(actual: number, expected: number): void {
    expect(actual).toBeCloseTo(expected, 5);
  }

  public createLinearScale(): LinearParameterScale {
    return new LinearParameterScale(10, 110);
  }

  public createBipolarScale(): BipolarLinearParameterScale {
    return new BipolarLinearParameterScale(-100, 100);
  }

  public createLogFrequencyScale(): LogarithmicFrequencyScale {
    return new LogarithmicFrequencyScale(20, 20_000);
  }

  public createExponentialScale(): ExponentialParameterScale {
    return new ExponentialParameterScale(0, 100, 2);
  }

  public createSteppedScale(): SteppedParameterScale {
    return new SteppedParameterScale(0, 10, 6);
  }

  public createDecibelScale(): DecibelGainScale {
    return new DecibelGainScale(-60, 0);
  }
}

describe("music-core-synthesizer-parameters", () => {
  describe("frequency specifications", () => {
    it("should accept positive finite frequency values", () => {
      expect(new FrequencySpecification().isSatisfiedBy(440)).toBe(true);
    });

    it("should reject zero, negative, and non-finite frequency values", () => {
      const specification = new FrequencySpecification();

      expect(specification.isSatisfiedBy(0)).toBe(false);
      expect(specification.isSatisfiedBy(-1)).toBe(false);
      expect(specification.isSatisfiedBy(Number.NaN)).toBe(false);
      expect(specification.isSatisfiedBy(Number.POSITIVE_INFINITY)).toBe(false);
    });

    it("should support chained audible frequency range specifications", () => {
      const specification = FrequencySpecification.audibleRange();

      expect(specification.isSatisfiedBy(20)).toBe(true);
      expect(specification.isSatisfiedBy(440)).toBe(true);
      expect(specification.isSatisfiedBy(20_000)).toBe(true);
      expect(specification.isSatisfiedBy(10)).toBe(false);
      expect(specification.isSatisfiedBy(30_000)).toBe(false);
    });

    it("should support chained lfo or audible frequency logic", () => {
      const specification = FrequencySpecification.audioOrLfoRange();

      expect(specification.isSatisfiedBy(0.5)).toBe(true);
      expect(specification.isSatisfiedBy(440)).toBe(true);
      expect(specification.isSatisfiedBy(-1)).toBe(false);
    });

    it("should reject invalid frequency band construction", () => {
      expect(() => new FrequencyBandSpecification(200, 100)).toThrow(
        "maximumHz must be greater than or equal to minimumHz.",
      );
    });
  });

  describe("normalized specifications and value objects", () => {
    it("should accept unipolar normalized values between 0 and 1", () => {
      const specification = UnipolarNormalizedSpecification.zeroToOne();

      expect(specification.isSatisfiedBy(0)).toBe(true);
      expect(specification.isSatisfiedBy(0.5)).toBe(true);
      expect(specification.isSatisfiedBy(1)).toBe(true);
    });

    it("should reject unipolar normalized values outside 0 and 1", () => {
      const specification = UnipolarNormalizedSpecification.zeroToOne();

      expect(specification.isSatisfiedBy(-0.01)).toBe(false);
      expect(specification.isSatisfiedBy(1.01)).toBe(false);
    });

    it("should accept bipolar normalized values between -1 and 1", () => {
      const specification = BipolarNormalizedSpecification.minusOneToOne();

      expect(specification.isSatisfiedBy(-1)).toBe(true);
      expect(specification.isSatisfiedBy(0)).toBe(true);
      expect(specification.isSatisfiedBy(1)).toBe(true);
    });

    it("should create valid normalized value objects", () => {
      expect(UnipolarNormalized.create(0.5).value()).toBe(0.5);
      expect(BipolarNormalized.create(-0.5).value()).toBe(-0.5);
    });

    it("should reject invalid normalized value objects", () => {
      expect(() => UnipolarNormalized.create(1.1)).toThrow("unipolarNormalized");
      expect(() => BipolarNormalized.create(-1.1)).toThrow("bipolarNormalized");
    });
  });

  describe("parameter value objects", () => {
    it("should create valid scalar parameter value objects", () => {
      expect(FrequencyHz.create(440).value()).toBe(440);
      expect(Percentage.create(50).value()).toBe(50);
      expect(ParameterSeconds.create(1.25).value()).toBe(1.25);
      expect(ParameterMilliseconds.create(250).value()).toBe(250);
      expect(ParameterSamples.create(128).value()).toBe(128);
      expect(Decibels.create(-6).value()).toBe(-6);
      expect(LinearGain.create(0).value()).toBe(0);
      expect(FrequencyRatio.create(2).value()).toBe(2);
      expect(ResonanceQ.create(0.707).value()).toBe(0.707);
      expect(SampleRateHz.create(48_000).value()).toBe(48_000);
      expect(DryWetMix.create(0.25).value()).toBe(0.25);
      expect(Pan.create(-0.25).value()).toBe(-0.25);
      expect(ModulationAmount.create(0.75).value()).toBe(0.75);
      expect(ModulationDepth.create(0.75).value()).toBe(0.75);
    });

    it("should reject invalid scalar parameter value objects", () => {
      expect(() => FrequencyHz.create(0)).toThrow("frequencyHz");
      expect(() => Percentage.create(101)).toThrow("percentage");
      expect(() => ParameterSeconds.create(-1)).toThrow("seconds");
      expect(() => ParameterMilliseconds.create(-1)).toThrow("milliseconds");
      expect(() => ParameterSamples.create(1.5)).toThrow("samples");
      expect(() => Decibels.create(Number.NaN)).toThrow("decibels");
      expect(() => LinearGain.create(-0.1)).toThrow("linearGain");
      expect(() => FrequencyRatio.create(0)).toThrow("frequencyRatio");
      expect(() => ResonanceQ.create(0)).toThrow("resonanceQ");
      expect(() => SampleRateHz.create(0)).toThrow("sampleRateHz");
      expect(() => DryWetMix.create(1.1)).toThrow("dryWetMix");
      expect(() => Pan.create(1.1)).toThrow("pan");
      expect(() => ModulationAmount.create(-1.1)).toThrow("modulationAmount");
      expect(() => ModulationDepth.create(1.1)).toThrow("modulationDepth");
    });
  });

  describe("scales", () => {
    it("should map normalized values through a linear scale", () => {
      const scale = new SynthesizerParametersFixture().createLinearScale();

      expect(scale.fromNormalized(0)).toBe(10);
      expect(scale.fromNormalized(0.5)).toBe(60);
      expect(scale.fromNormalized(1)).toBe(110);
      expect(scale.toNormalized(60)).toBe(0.5);
    });

    it("should map normalized values through a bipolar linear scale", () => {
      const scale = new SynthesizerParametersFixture().createBipolarScale();

      expect(scale.fromNormalized(0)).toBe(-100);
      expect(scale.fromNormalized(0.5)).toBe(0);
      expect(scale.fromNormalized(1)).toBe(100);
      expect(scale.toNormalized(0)).toBe(0.5);
    });

    it("should map normalized values through a logarithmic frequency scale", () => {
      const fixture = new SynthesizerParametersFixture();
      const scale = fixture.createLogFrequencyScale();

      expect(scale.fromNormalized(0)).toBe(20);
      expect(scale.fromNormalized(1)).toBe(20_000);
      fixture.expectCloseTo(scale.toNormalized(20), 0);
      fixture.expectCloseTo(scale.toNormalized(20_000), 1);
    });

    it("should map normalized values through an exponential scale", () => {
      const scale = new SynthesizerParametersFixture().createExponentialScale();

      expect(scale.fromNormalized(0)).toBe(0);
      expect(scale.fromNormalized(0.5)).toBe(25);
      expect(scale.fromNormalized(1)).toBe(100);
      expect(scale.toNormalized(25)).toBe(0.5);
    });

    it("should map normalized values through a stepped scale", () => {
      const scale = new SynthesizerParametersFixture().createSteppedScale();

      expect(scale.fromNormalized(0)).toBe(0);
      expect(scale.fromNormalized(0.5)).toBe(6);
      expect(scale.fromNormalized(1)).toBe(10);
      expect(scale.toNormalized(6)).toBe(0.6);
    });

    it("should map normalized values through a decibel scale", () => {
      const scale = new SynthesizerParametersFixture().createDecibelScale();

      expect(scale.fromNormalized(0)).toBe(-60);
      expect(scale.fromNormalized(0.5)).toBe(-30);
      expect(scale.fromNormalized(1)).toBe(0);
      expect(scale.toNormalized(-30)).toBe(0.5);
    });
  });

  describe("converters", () => {
    it("should convert decibels to linear gain", () => {
      const fixture = new SynthesizerParametersFixture();
      const converter = new DecibelsToLinearGainConverter();

      expect(converter.convert(0)).toBe(1);
      fixture.expectCloseTo(converter.convert(-6), 0.501187);
    });

    it("should convert linear gain to decibels", () => {
      const fixture = new SynthesizerParametersFixture();
      const converter = new LinearGainToDecibelsConverter();

      expect(converter.convert(1)).toBe(0);
      fixture.expectCloseTo(converter.convert(0.5), -6.020599);
    });

    it("should convert cents to frequency ratio", () => {
      const fixture = new SynthesizerParametersFixture();
      const converter = new CentsToFrequencyRatioConverter();

      expect(converter.convert(0)).toBe(1);
      expect(converter.convert(1_200)).toBe(2);
      fixture.expectCloseTo(converter.convert(-1_200), 0.5);
    });

    it("should convert frequency ratio to cents", () => {
      const converter = new FrequencyRatioToCentsConverter();

      expect(converter.convert(1)).toBe(0);
      expect(converter.convert(2)).toBe(1_200);
      expect(converter.convert(0.5)).toBe(-1_200);
    });

    it("should convert semitones to frequency ratio", () => {
      const converter = new SemitoneToFrequencyRatioConverter();

      expect(converter.convert(0)).toBe(1);
      expect(converter.convert(12)).toBe(2);
    });

    it("should convert frequency ratio to semitones", () => {
      const converter = new FrequencyRatioToSemitoneConverter();

      expect(converter.convert(1)).toBe(0);
      expect(converter.convert(2)).toBe(12);
    });

    it("should convert seconds and milliseconds", () => {
      expect(new SecondsToMillisecondsConverter().convert(1.5)).toBe(1_500);
    });

    it("should convert seconds to samples", () => {
      expect(new SecondsToSamplesConverter(48_000).convert(0.5)).toBe(24_000);
    });
  });
});
