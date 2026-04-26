import { describe, expect, it } from "vitest";

import {
  BasicOscillatorDefinitionSpecification,
  OscillatorDefinitionSpecification,
  OscillatorDefinitionValidator,
  OscillatorFrequencySpecification,
  OscillatorKind,
  OscillatorVelocitySpecification,
  OscillatorWaveformKind,
  PulseOscillatorDefinitionSpecification,
  PulseWidthSpecification,
  type IBasicOscillatorDefinition,
  type IPulseOscillatorDefinition,
  type ISampleOscillatorDefinition,
  type IWavetableOscillatorDefinition,
} from "../src/index.js";

class OscillatorContractsFixture {
  public createBasicDefinition(): IBasicOscillatorDefinition {
    return {
      kind: OscillatorKind.Basic,
      waveform: OscillatorWaveformKind.Sine,
      frequencyHz: 440,
      detuneCents: 0,
      phaseRadians: 0,
      gain: 1,
    };
  }

  public createPulseDefinition(): IPulseOscillatorDefinition {
    return {
      kind: OscillatorKind.Pulse,
      frequencyHz: 110,
      detuneCents: 0,
      phaseRadians: 0,
      gain: 0.5,
      pulseWidth: 0.5,
    };
  }

  public createWavetableDefinition(): IWavetableOscillatorDefinition {
    return {
      kind: OscillatorKind.Wavetable,
      tableId: "table-alpha",
      frequencyHz: 220,
      detuneCents: 0,
      phaseRadians: 0,
      gain: 0.75,
    };
  }

  public createSampleDefinition(): ISampleOscillatorDefinition {
    return {
      kind: OscillatorKind.Sample,
      sampleId: "sample-alpha",
      rootFrequencyHz: 440,
      playbackFrequencyHz: 880,
      gain: 1,
      loop: true,
    };
  }
}

describe("music-core-synthesizer-oscillators-contracts", () => {
  describe("exports", () => {
    it("should expose stable oscillator kind constants", () => {
      expect(OscillatorKind.Basic).toBe("basic");
      expect(OscillatorKind.Pulse).toBe("pulse");
      expect(OscillatorKind.Wavetable).toBe("wavetable");
      expect(OscillatorKind.Sample).toBe("sample");
    });

    it("should expose stable waveform constants", () => {
      expect(OscillatorWaveformKind.Sine).toBe("sine");
      expect(OscillatorWaveformKind.Square).toBe("square");
      expect(OscillatorWaveformKind.Sawtooth).toBe("sawtooth");
      expect(OscillatorWaveformKind.Triangle).toBe("triangle");
    });
  });

  describe("parameter specifications", () => {
    it("should validate oscillator frequency", () => {
      const specification = OscillatorFrequencySpecification.positiveFinite();

      expect(specification.isSatisfiedBy(440)).toBe(true);
      expect(specification.isSatisfiedBy(0)).toBe(false);
      expect(specification.isSatisfiedBy(Number.NaN)).toBe(false);
    });

    it("should validate oscillator velocity", () => {
      const specification = OscillatorVelocitySpecification.zeroToOne();

      expect(specification.isSatisfiedBy(0)).toBe(true);
      expect(specification.isSatisfiedBy(0.5)).toBe(true);
      expect(specification.isSatisfiedBy(1)).toBe(true);
      expect(specification.isSatisfiedBy(2)).toBe(false);
    });

    it("should validate pulse width", () => {
      const specification = PulseWidthSpecification.zeroToOne();

      expect(specification.isSatisfiedBy(0.5)).toBe(true);
      expect(specification.isSatisfiedBy(-0.1)).toBe(false);
      expect(specification.isSatisfiedBy(1.1)).toBe(false);
    });
  });

  describe("definition specifications", () => {
    it("should validate basic oscillator definitions", () => {
      const fixture = new OscillatorContractsFixture();

      expect(
        new BasicOscillatorDefinitionSpecification().isSatisfiedBy(
          fixture.createBasicDefinition(),
        ),
      ).toBe(true);
    });

    it("should validate pulse oscillator definitions", () => {
      const fixture = new OscillatorContractsFixture();

      expect(
        new PulseOscillatorDefinitionSpecification().isSatisfiedBy(
          fixture.createPulseDefinition(),
        ),
      ).toBe(true);
    });

    it("should validate all oscillator definition variants", () => {
      const fixture = new OscillatorContractsFixture();
      const specification = OscillatorDefinitionSpecification.valid();

      expect(specification.isSatisfiedBy(fixture.createBasicDefinition())).toBe(true);
      expect(specification.isSatisfiedBy(fixture.createPulseDefinition())).toBe(true);
      expect(specification.isSatisfiedBy(fixture.createWavetableDefinition())).toBe(true);
      expect(specification.isSatisfiedBy(fixture.createSampleDefinition())).toBe(true);
    });

    it("should reject invalid oscillator definitions", () => {
      const fixture = new OscillatorContractsFixture();

      expect(
        OscillatorDefinitionSpecification.valid().isSatisfiedBy({
          ...fixture.createBasicDefinition(),
          frequencyHz: 0,
        }),
      ).toBe(false);

      expect(
        OscillatorDefinitionSpecification.valid().isSatisfiedBy({
          ...fixture.createPulseDefinition(),
          pulseWidth: 2,
        }),
      ).toBe(false);

      expect(
        OscillatorDefinitionSpecification.valid().isSatisfiedBy({
          ...fixture.createWavetableDefinition(),
          tableId: "",
        }),
      ).toBe(false);
    });
  });

  describe("validator", () => {
    it("should allow valid definitions", () => {
      const fixture = new OscillatorContractsFixture();
      const validator = OscillatorDefinitionValidator.createDefault();

      expect(() => validator.validate(fixture.createBasicDefinition())).not.toThrow();
      expect(() => validator.validate(fixture.createPulseDefinition())).not.toThrow();
      expect(() => validator.validate(fixture.createWavetableDefinition())).not.toThrow();
      expect(() => validator.validate(fixture.createSampleDefinition())).not.toThrow();
    });

    it("should reject invalid definitions", () => {
      const fixture = new OscillatorContractsFixture();
      const validator = OscillatorDefinitionValidator.createDefault();

      expect(() =>
        validator.validate({
          ...fixture.createBasicDefinition(),
          frequencyHz: 0,
        }),
      ).toThrow("Oscillator definition is invalid");
    });
  });
});
