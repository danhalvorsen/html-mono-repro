import { describe, expect, it } from "vitest";

import {
  EnvelopeCurveKind,
  EnvelopeKind,
  EnvelopeStage,
  type IAdsrEnvelopeDefinition,
  type IAhdsrEnvelopeDefinition,
  type IOneShotEnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

import {
  EnvelopeCurveEvaluatorFactory,
  EnvelopeFactory,
  EnvelopeMath,
  ExponentialEnvelopeCurveEvaluator,
  InstantEnvelopeCurveEvaluator,
  LinearEnvelopeCurveEvaluator,
  LogarithmicEnvelopeCurveEvaluator,
} from "../src/index.js";

class EnvelopeFixture {
  public readonly linearCurve = {
    kind: EnvelopeCurveKind.Linear,
  } as const;

  public createAdsrDefinition(): IAdsrEnvelopeDefinition {
    return {
      kind: EnvelopeKind.Adsr,
      attackSeconds: 1,
      decaySeconds: 1,
      sustainLevel: 0.5,
      releaseSeconds: 1,
      attackCurve: this.linearCurve,
      decayCurve: this.linearCurve,
      releaseCurve: this.linearCurve,
    };
  }

  public createAhdsrDefinition(): IAhdsrEnvelopeDefinition {
    return {
      kind: EnvelopeKind.Ahdsr,
      attackSeconds: 1,
      holdSeconds: 1,
      decaySeconds: 1,
      sustainLevel: 0.5,
      releaseSeconds: 1,
      attackCurve: this.linearCurve,
      decayCurve: this.linearCurve,
      releaseCurve: this.linearCurve,
    };
  }

  public createOneShotDefinition(): IOneShotEnvelopeDefinition {
    return {
      kind: EnvelopeKind.OneShot,
      attackSeconds: 1,
      decaySeconds: 1,
      attackCurve: this.linearCurve,
      decayCurve: this.linearCurve,
    };
  }

  public expectCloseTo(actual: number, expected: number): void {
    expect(actual).toBeCloseTo(expected, 6);
  }
}

describe("music-core-synthesizer-envelopes", () => {
  describe("curve evaluators", () => {
    it("should evaluate linear curves", () => {
      expect(new LinearEnvelopeCurveEvaluator().evaluate(0.5)).toBe(0.5);
    });

    it("should evaluate exponential curves", () => {
      expect(new ExponentialEnvelopeCurveEvaluator().evaluate(0.5)).toBe(0.25);
    });

    it("should evaluate logarithmic curves", () => {
      expect(new LogarithmicEnvelopeCurveEvaluator().evaluate(0.25)).toBe(0.5);
    });

    it("should evaluate instant curves", () => {
      expect(new InstantEnvelopeCurveEvaluator().evaluate(0)).toBe(0);
      expect(new InstantEnvelopeCurveEvaluator().evaluate(0.1)).toBe(1);
    });

    it("should resolve curve evaluators from curve definitions", () => {
      const factory = new EnvelopeCurveEvaluatorFactory();

      expect(factory.create({ kind: EnvelopeCurveKind.Linear })).toBeInstanceOf(
        LinearEnvelopeCurveEvaluator,
      );

      expect(factory.create({ kind: EnvelopeCurveKind.Exponential })).toBeInstanceOf(
        ExponentialEnvelopeCurveEvaluator,
      );

      expect(factory.create({ kind: EnvelopeCurveKind.Logarithmic })).toBeInstanceOf(
        LogarithmicEnvelopeCurveEvaluator,
      );

      expect(factory.create({ kind: EnvelopeCurveKind.Instant })).toBeInstanceOf(
        InstantEnvelopeCurveEvaluator,
      );
    });
  });

  describe("envelope math", () => {
    it("should clamp values to normalized range", () => {
      expect(EnvelopeMath.clamp01(-1)).toBe(0);
      expect(EnvelopeMath.clamp01(0.5)).toBe(0.5);
      expect(EnvelopeMath.clamp01(2)).toBe(1);
      expect(EnvelopeMath.clamp01(Number.NaN)).toBe(0);
    });

    it("should interpolate levels", () => {
      expect(EnvelopeMath.interpolate(0, 1, 0.5)).toBe(0.5);
      expect(EnvelopeMath.interpolate(1, 0, 0.25)).toBe(0.75);
    });
  });

  describe("ADSR runtime", () => {
    it("should sample attack stage", () => {
      const fixture = new EnvelopeFixture();
      const envelope = EnvelopeFactory.createDefault().create(
        fixture.createAdsrDefinition(),
      );

      envelope.gateOn({
        timeSeconds: 0,
        velocity: 1,
      });

      const sample = envelope.sample({
        timeSeconds: 0.5,
      });

      expect(sample.stage).toBe(EnvelopeStage.Attack);
      fixture.expectCloseTo(sample.level, 0.5);
    });

    it("should sample decay stage", () => {
      const fixture = new EnvelopeFixture();
      const envelope = EnvelopeFactory.createDefault().create(
        fixture.createAdsrDefinition(),
      );

      envelope.gateOn({
        timeSeconds: 0,
        velocity: 1,
      });

      const sample = envelope.sample({
        timeSeconds: 1.5,
      });

      expect(sample.stage).toBe(EnvelopeStage.Decay);
      fixture.expectCloseTo(sample.level, 0.75);
    });

    it("should sample sustain stage", () => {
      const fixture = new EnvelopeFixture();
      const envelope = EnvelopeFactory.createDefault().create(
        fixture.createAdsrDefinition(),
      );

      envelope.gateOn({
        timeSeconds: 0,
        velocity: 1,
      });

      const sample = envelope.sample({
        timeSeconds: 3,
      });

      expect(sample.stage).toBe(EnvelopeStage.Sustain);
      fixture.expectCloseTo(sample.level, 0.5);
    });

    it("should sample release stage and completion", () => {
      const fixture = new EnvelopeFixture();
      const envelope = EnvelopeFactory.createDefault().create(
        fixture.createAdsrDefinition(),
      );

      envelope.gateOn({
        timeSeconds: 0,
        velocity: 1,
      });

      envelope.sample({
        timeSeconds: 3,
      });

      envelope.gateOff({
        timeSeconds: 3,
      });

      const releaseSample = envelope.sample({
        timeSeconds: 3.5,
      });

      expect(releaseSample.stage).toBe(EnvelopeStage.Release);
      fixture.expectCloseTo(releaseSample.level, 0.25);

      const completeSample = envelope.sample({
        timeSeconds: 4.1,
      });

      expect(completeSample.stage).toBe(EnvelopeStage.Complete);
      expect(completeSample.level).toBe(0);
      expect(completeSample.isComplete).toBe(true);
    });

    it("should reset state", () => {
      const fixture = new EnvelopeFixture();
      const envelope = EnvelopeFactory.createDefault().create(
        fixture.createAdsrDefinition(),
      );

      envelope.gateOn({
        timeSeconds: 0,
        velocity: 1,
      });

      envelope.reset();

      const snapshot = envelope.snapshot();

      expect(snapshot.stage).toBe(EnvelopeStage.Idle);
      expect(snapshot.currentLevel).toBe(0);
      expect(snapshot.isGateOpen).toBe(false);
      expect(snapshot.isComplete).toBe(false);
    });
  });

  describe("AHDSR runtime", () => {
    it("should sample hold stage", () => {
      const fixture = new EnvelopeFixture();
      const envelope = EnvelopeFactory.createDefault().create(
        fixture.createAhdsrDefinition(),
      );

      envelope.gateOn({
        timeSeconds: 0,
        velocity: 1,
      });

      const sample = envelope.sample({
        timeSeconds: 1.5,
      });

      expect(sample.stage).toBe(EnvelopeStage.Hold);
      expect(sample.level).toBe(1);
    });
  });

  describe("one-shot runtime", () => {
    it("should complete after attack and decay", () => {
      const fixture = new EnvelopeFixture();
      const envelope = EnvelopeFactory.createDefault().create(
        fixture.createOneShotDefinition(),
      );

      envelope.gateOn({
        timeSeconds: 0,
        velocity: 1,
      });

      const attackSample = envelope.sample({
        timeSeconds: 0.5,
      });

      expect(attackSample.stage).toBe(EnvelopeStage.Attack);
      fixture.expectCloseTo(attackSample.level, 0.5);

      const decaySample = envelope.sample({
        timeSeconds: 1.5,
      });

      expect(decaySample.stage).toBe(EnvelopeStage.Decay);
      fixture.expectCloseTo(decaySample.level, 0.5);

      const completeSample = envelope.sample({
        timeSeconds: 2.1,
      });

      expect(completeSample.stage).toBe(EnvelopeStage.Complete);
      expect(completeSample.level).toBe(0);
      expect(completeSample.isComplete).toBe(true);
    });
  });

  describe("factory validation", () => {
    it("should reject invalid envelope definitions", () => {
      const fixture = new EnvelopeFixture();
      const invalidDefinition = {
        ...fixture.createAdsrDefinition(),
        sustainLevel: 2,
      };

      expect(() =>
        EnvelopeFactory.createDefault().create(invalidDefinition),
      ).toThrow("Envelope definition is invalid");
    });

    it("should reject invalid gate velocity", () => {
      const fixture = new EnvelopeFixture();
      const envelope = EnvelopeFactory.createDefault().create(
        fixture.createAdsrDefinition(),
      );

      expect(() =>
        envelope.gateOn({
          timeSeconds: 0,
          velocity: 2,
        }),
      ).toThrow("velocity must be between 0 and 1");
    });
  });
});
