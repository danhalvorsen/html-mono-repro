import { describe, expect, it } from "vitest";

import {
  OscillatorKind,
  OscillatorWaveformKind,
  type IBasicOscillatorDefinition,
  type IPulseOscillatorDefinition,
  type ISampleOscillatorDefinition,
  type IWavetableOscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import {
  BasicOscillatorAlgorithm,
  OscillatorDefinitionValidator,
  OscillatorFactory,
  OscillatorMath,
  PulseOscillatorAlgorithm,
  type ISampleBuffer,
  type ISampleBufferProvider,
  type IWavetable,
  type IWavetableProvider,
} from "../src/index.js";

class TestWavetable implements IWavetable {
  public sample(phase01: number): number {
    return phase01 < 0.5 ? 0.25 : -0.25;
  }
}

class TestWavetableProvider implements IWavetableProvider {
  public get(_tableId: string): IWavetable {
    return new TestWavetable();
  }
}

class TestSampleBuffer implements ISampleBuffer {
  public readonly length = 4;

  public sample(position: number): number {
    const index = Math.round(position);

    if (index <= 0) {
      return -1;
    }

    if (index === 1) {
      return -0.5;
    }

    if (index === 2) {
      return 0.5;
    }

    return 1;
  }
}

class TestSampleBufferProvider implements ISampleBufferProvider {
  public get(_sampleId: string): ISampleBuffer {
    return new TestSampleBuffer();
  }
}

class OscillatorFixture {
  public createBasicDefinition(): IBasicOscillatorDefinition {
    return {
      kind: OscillatorKind.Basic,
      waveform: OscillatorWaveformKind.Sine,
      frequencyHz: 1,
      detuneCents: 0,
      phaseRadians: 0,
      gain: 1,
    };
  }

  public createSawDefinition(): IBasicOscillatorDefinition {
    return {
      ...this.createBasicDefinition(),
      waveform: OscillatorWaveformKind.Sawtooth,
    };
  }

  public createPulseDefinition(): IPulseOscillatorDefinition {
    return {
      kind: OscillatorKind.Pulse,
      frequencyHz: 1,
      detuneCents: 0,
      phaseRadians: 0,
      gain: 1,
      pulseWidth: 0.25,
    };
  }

  public createWavetableDefinition(): IWavetableOscillatorDefinition {
    return {
      kind: OscillatorKind.Wavetable,
      tableId: "table-alpha",
      frequencyHz: 1,
      detuneCents: 0,
      phaseRadians: 0,
      gain: 1,
    };
  }

  public createSampleDefinition(): ISampleOscillatorDefinition {
    return {
      kind: OscillatorKind.Sample,
      sampleId: "sample-alpha",
      rootFrequencyHz: 440,
      playbackFrequencyHz: 440,
      gain: 1,
      loop: true,
    };
  }

  public createFactory(): OscillatorFactory {
    return OscillatorFactory.createWithProviders({
      wavetableProvider: new TestWavetableProvider(),
      sampleBufferProvider: new TestSampleBufferProvider(),
    });
  }
}

describe("music-core-synthesizer-oscillators", () => {
  describe("math", () => {
    it("should wrap phase into normalized cycle", () => {
      expect(OscillatorMath.wrap01(0)).toBe(0);
      expect(OscillatorMath.wrap01(1)).toBe(0);
      expect(OscillatorMath.wrap01(1.25)).toBe(0.25);
      expect(OscillatorMath.wrap01(-0.25)).toBe(0.75);
    });

    it("should convert cents to frequency ratio", () => {
      expect(OscillatorMath.centsToFrequencyRatio(0)).toBe(1);
      expect(OscillatorMath.centsToFrequencyRatio(1_200)).toBe(2);
    });
  });

  describe("validation", () => {
    it("should allow valid oscillator definitions", () => {
      const fixture = new OscillatorFixture();
      const validator = new OscillatorDefinitionValidator();

      expect(() => validator.validate(fixture.createBasicDefinition())).not.toThrow();
      expect(() => validator.validate(fixture.createPulseDefinition())).not.toThrow();
      expect(() => validator.validate(fixture.createWavetableDefinition())).not.toThrow();
      expect(() => validator.validate(fixture.createSampleDefinition())).not.toThrow();
    });

    it("should reject invalid oscillator definitions", () => {
      const fixture = new OscillatorFixture();
      const validator = new OscillatorDefinitionValidator();

      expect(() =>
        validator.validate({
          ...fixture.createBasicDefinition(),
          frequencyHz: 0,
        }),
      ).toThrow("frequencyHz");

      expect(() =>
        validator.validate({
          ...fixture.createPulseDefinition(),
          pulseWidth: 2,
        }),
      ).toThrow("pulseWidth");
    });
  });

  describe("algorithms", () => {
    it("should sample sine oscillator", () => {
      const fixture = new OscillatorFixture();
      const algorithm = new BasicOscillatorAlgorithm();

      expect(algorithm.sample(fixture.createBasicDefinition(), 0)).toBeCloseTo(0, 6);
      expect(algorithm.sample(fixture.createBasicDefinition(), 0.25)).toBeCloseTo(1, 6);
      expect(algorithm.sample(fixture.createBasicDefinition(), 0.75)).toBeCloseTo(-1, 6);
    });

    it("should sample saw oscillator", () => {
      const fixture = new OscillatorFixture();
      const algorithm = new BasicOscillatorAlgorithm();

      expect(algorithm.sample(fixture.createSawDefinition(), 0)).toBe(-1);
      expect(algorithm.sample(fixture.createSawDefinition(), 0.5)).toBe(0);
      expect(algorithm.sample(fixture.createSawDefinition(), 1)).toBe(-1);
    });

    it("should sample pulse oscillator", () => {
      const fixture = new OscillatorFixture();
      const algorithm = new PulseOscillatorAlgorithm();

      expect(algorithm.sample(fixture.createPulseDefinition(), 0)).toBe(1);
      expect(algorithm.sample(fixture.createPulseDefinition(), 0.24)).toBe(1);
      expect(algorithm.sample(fixture.createPulseDefinition(), 0.25)).toBe(-1);
    });
  });

  describe("runtime", () => {
    it("should return silence before note-on", () => {
      const fixture = new OscillatorFixture();
      const oscillator = fixture.createFactory().create(fixture.createBasicDefinition());

      expect(
        oscillator.sample({
          timeSeconds: 0,
          sampleRateHz: 4,
        }),
      ).toEqual({
        timeSeconds: 0,
        value: 0,
      });
    });

    it("should sample active oscillator deterministically", () => {
      const fixture = new OscillatorFixture();
      const oscillator = fixture.createFactory().create(fixture.createBasicDefinition());

      oscillator.noteOn({
        timeSeconds: 0,
        frequencyHz: 1,
        velocity: 1,
      });

      expect(oscillator.sample({ timeSeconds: 0, sampleRateHz: 4 }).value).toBeCloseTo(0, 6);
      expect(oscillator.sample({ timeSeconds: 0.25, sampleRateHz: 4 }).value).toBeCloseTo(1, 6);
      expect(oscillator.sample({ timeSeconds: 0.5, sampleRateHz: 4 }).value).toBeCloseTo(0, 6);
      expect(oscillator.sample({ timeSeconds: 0.75, sampleRateHz: 4 }).value).toBeCloseTo(-1, 6);
    });

    it("should apply definition gain", () => {
      const fixture = new OscillatorFixture();
      const oscillator = fixture.createFactory().create({
        ...fixture.createBasicDefinition(),
        gain: 0.5,
      });

      oscillator.noteOn({
        timeSeconds: 0,
        frequencyHz: 1,
        velocity: 1,
      });

      oscillator.sample({ timeSeconds: 0, sampleRateHz: 4 });

      expect(
        oscillator.sample({
          timeSeconds: 0.25,
          sampleRateHz: 4,
        }).value,
      ).toBeCloseTo(0.5, 6);
    });

    it("should stop producing samples after note-off", () => {
      const fixture = new OscillatorFixture();
      const oscillator = fixture.createFactory().create(fixture.createBasicDefinition());

      oscillator.noteOn({
        timeSeconds: 0,
        frequencyHz: 1,
        velocity: 1,
      });

      oscillator.noteOff({
        timeSeconds: 0.5,
      });

      expect(
        oscillator.sample({
          timeSeconds: 0.5,
          sampleRateHz: 4,
        }).value,
      ).toBe(0);

      expect(oscillator.snapshot().isActive).toBe(false);
    });

    it("should reset oscillator state", () => {
      const fixture = new OscillatorFixture();
      const oscillator = fixture.createFactory().create(fixture.createBasicDefinition());

      oscillator.noteOn({
        timeSeconds: 0,
        frequencyHz: 1,
        velocity: 1,
      });

      oscillator.reset();

      expect(oscillator.snapshot().isActive).toBe(false);
      expect(oscillator.snapshot().frequencyHz).toBe(1);
    });

    it("should sample wavetable oscillator through provider", () => {
      const fixture = new OscillatorFixture();
      const oscillator = fixture.createFactory().create(fixture.createWavetableDefinition());

      oscillator.noteOn({
        timeSeconds: 0,
        frequencyHz: 1,
        velocity: 1,
      });

      expect(oscillator.sample({ timeSeconds: 0, sampleRateHz: 4 }).value).toBe(0.25);
      expect(oscillator.sample({ timeSeconds: 0.25, sampleRateHz: 4 }).value).toBe(0.25);
      expect(oscillator.sample({ timeSeconds: 0.5, sampleRateHz: 4 }).value).toBe(-0.25);
    });

    it("should sample sample-buffer oscillator through provider", () => {
      const fixture = new OscillatorFixture();
      const oscillator = fixture.createFactory().create(fixture.createSampleDefinition());

      oscillator.noteOn({
        timeSeconds: 0,
        frequencyHz: 440,
        velocity: 1,
      });

      expect(oscillator.sample({ timeSeconds: 0, sampleRateHz: 4 }).value).toBe(-1);
      expect(oscillator.sample({ timeSeconds: 0.25, sampleRateHz: 4 }).value).toBe(-0.5);
    });

    it("should reject invalid note-on velocity", () => {
      const fixture = new OscillatorFixture();
      const oscillator = fixture.createFactory().create(fixture.createBasicDefinition());

      expect(() =>
        oscillator.noteOn({
          timeSeconds: 0,
          frequencyHz: 1,
          velocity: 2,
        }),
      ).toThrow("velocity");
    });
  });
});
