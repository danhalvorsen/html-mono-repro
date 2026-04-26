import { describe, expect, it } from "vitest";

import {
  AdsrEnvelopeDefinitionSpecification,
  AhdsrEnvelopeDefinitionSpecification,
  ArEnvelopeDefinitionSpecification,
  AsrEnvelopeDefinitionSpecification,
  EnvelopeCurveDefinitionSpecification,
  EnvelopeCurveKind,
  EnvelopeDefinitionSpecification,
  EnvelopeDefinitionValidator,
  EnvelopeKind,
  EnvelopeStage,
  EnvelopeVelocitySpecification,
  OneShotEnvelopeDefinitionSpecification,
  type IAdsrEnvelopeDefinition,
  type IAhdsrEnvelopeDefinition,
  type IArEnvelopeDefinition,
  type IAsrEnvelopeDefinition,
  type IEnvelope,
  type IEnvelopeFactory,
  type IEnvelopeSample,
  type IEnvelopeSampleRequest,
  type IEnvelopeStateSnapshot,
  type IOneShotEnvelopeDefinition,
} from "../src/index.js";

class EnvelopeContractsFixture {
  public readonly linearCurve = {
    kind: EnvelopeCurveKind.Linear,
  } as const;

  public createAdsrDefinition(): IAdsrEnvelopeDefinition {
    return {
      kind: EnvelopeKind.Adsr,
      attackSeconds: 0.01,
      decaySeconds: 0.2,
      sustainLevel: 0.7,
      releaseSeconds: 0.4,
      attackCurve: this.linearCurve,
      decayCurve: this.linearCurve,
      releaseCurve: this.linearCurve,
    };
  }

  public createAhdsrDefinition(): IAhdsrEnvelopeDefinition {
    return {
      kind: EnvelopeKind.Ahdsr,
      attackSeconds: 0.01,
      holdSeconds: 0.05,
      decaySeconds: 0.2,
      sustainLevel: 0.7,
      releaseSeconds: 0.4,
      attackCurve: this.linearCurve,
      decayCurve: this.linearCurve,
      releaseCurve: this.linearCurve,
    };
  }

  public createArDefinition(): IArEnvelopeDefinition {
    return {
      kind: EnvelopeKind.Ar,
      attackSeconds: 0.01,
      releaseSeconds: 0.4,
      attackCurve: this.linearCurve,
      releaseCurve: this.linearCurve,
    };
  }

  public createAsrDefinition(): IAsrEnvelopeDefinition {
    return {
      kind: EnvelopeKind.Asr,
      attackSeconds: 0.01,
      sustainLevel: 0.5,
      releaseSeconds: 0.4,
      attackCurve: this.linearCurve,
      releaseCurve: this.linearCurve,
    };
  }

  public createOneShotDefinition(): IOneShotEnvelopeDefinition {
    return {
      kind: EnvelopeKind.OneShot,
      attackSeconds: 0.01,
      decaySeconds: 0.2,
      attackCurve: this.linearCurve,
      decayCurve: this.linearCurve,
    };
  }
}

class TestEnvelope implements IEnvelope {
  private currentLevel = 0;
  private currentStage: typeof EnvelopeStage[keyof typeof EnvelopeStage] = EnvelopeStage.Idle;
  private gateOpen = false;
  private startedAtSeconds: number | null = null;
  private releasedAtSeconds: number | null = null;

  public constructor(public readonly definition: IAdsrEnvelopeDefinition) {}

  public gateOn(request: { readonly timeSeconds: number; readonly velocity: number }): void {
    this.gateOpen = true;
    this.startedAtSeconds = request.timeSeconds;
    this.currentLevel = request.velocity;
    this.currentStage = EnvelopeStage.Attack;
  }

  public gateOff(request: { readonly timeSeconds: number }): void {
    this.gateOpen = false;
    this.releasedAtSeconds = request.timeSeconds;
    this.currentStage = EnvelopeStage.Release;
  }

  public sample(request: IEnvelopeSampleRequest): IEnvelopeSample {
    return {
      timeSeconds: request.timeSeconds,
      level: this.currentLevel,
      stage: this.currentStage,
      isComplete: false,
    };
  }

  public snapshot(): IEnvelopeStateSnapshot {
    return {
      stage: this.currentStage,
      startedAtSeconds: this.startedAtSeconds,
      releasedAtSeconds: this.releasedAtSeconds,
      releaseStartLevel: this.currentLevel,
      currentLevel: this.currentLevel,
      isGateOpen: this.gateOpen,
      isComplete: false,
    };
  }

  public reset(): void {
    this.currentLevel = 0;
    this.currentStage = EnvelopeStage.Idle;
    this.gateOpen = false;
    this.startedAtSeconds = null;
    this.releasedAtSeconds = null;
  }
}

class TestEnvelopeFactory implements IEnvelopeFactory {
  public create(definition: IAdsrEnvelopeDefinition): IEnvelope {
    return new TestEnvelope(definition);
  }
}

describe("music-core-synthesizer-envelopes-contracts", () => {
  describe("constants", () => {
    it("should expose stable envelope kind values", () => {
      expect(EnvelopeKind.Adsr).toBe("adsr");
      expect(EnvelopeKind.Ahdsr).toBe("ahdsr");
      expect(EnvelopeKind.Ar).toBe("ar");
      expect(EnvelopeKind.Asr).toBe("asr");
      expect(EnvelopeKind.OneShot).toBe("one-shot");
    });

    it("should expose stable envelope stage values", () => {
      expect(EnvelopeStage.Idle).toBe("idle");
      expect(EnvelopeStage.Attack).toBe("attack");
      expect(EnvelopeStage.Decay).toBe("decay");
      expect(EnvelopeStage.Sustain).toBe("sustain");
      expect(EnvelopeStage.Release).toBe("release");
      expect(EnvelopeStage.Complete).toBe("complete");
    });

    it("should expose stable curve kind values", () => {
      expect(EnvelopeCurveKind.Linear).toBe("linear");
      expect(EnvelopeCurveKind.Exponential).toBe("exponential");
      expect(EnvelopeCurveKind.Logarithmic).toBe("logarithmic");
      expect(EnvelopeCurveKind.Instant).toBe("instant");
    });
  });

  describe("specifications", () => {
    it("should validate envelope curve definitions", () => {
      const specification = new EnvelopeCurveDefinitionSpecification();

      expect(specification.isSatisfiedBy({ kind: EnvelopeCurveKind.Linear })).toBe(true);
      expect(specification.isSatisfiedBy({ kind: "bad" as EnvelopeCurveKind })).toBe(false);
    });

    it("should validate ADSR definitions", () => {
      const fixture = new EnvelopeContractsFixture();

      expect(
        new AdsrEnvelopeDefinitionSpecification().isSatisfiedBy(
          fixture.createAdsrDefinition(),
        ),
      ).toBe(true);
    });

    it("should validate AHDSR definitions", () => {
      const fixture = new EnvelopeContractsFixture();

      expect(
        new AhdsrEnvelopeDefinitionSpecification().isSatisfiedBy(
          fixture.createAhdsrDefinition(),
        ),
      ).toBe(true);
    });

    it("should validate AR definitions", () => {
      const fixture = new EnvelopeContractsFixture();

      expect(
        new ArEnvelopeDefinitionSpecification().isSatisfiedBy(
          fixture.createArDefinition(),
        ),
      ).toBe(true);
    });

    it("should validate ASR definitions", () => {
      const fixture = new EnvelopeContractsFixture();

      expect(
        new AsrEnvelopeDefinitionSpecification().isSatisfiedBy(
          fixture.createAsrDefinition(),
        ),
      ).toBe(true);
    });

    it("should validate one-shot definitions", () => {
      const fixture = new EnvelopeContractsFixture();

      expect(
        new OneShotEnvelopeDefinitionSpecification().isSatisfiedBy(
          fixture.createOneShotDefinition(),
        ),
      ).toBe(true);
    });

    it("should reject definitions with invalid shared parameter values", () => {
      const fixture = new EnvelopeContractsFixture();
      const definition = {
        ...fixture.createAdsrDefinition(),
        sustainLevel: 1.1,
      };

      expect(
        new AdsrEnvelopeDefinitionSpecification().isSatisfiedBy(definition),
      ).toBe(false);
    });

    it("should validate the discriminated envelope union", () => {
      const fixture = new EnvelopeContractsFixture();
      const specification = EnvelopeDefinitionSpecification.valid();

      expect(specification.isSatisfiedBy(fixture.createAdsrDefinition())).toBe(true);
      expect(specification.isSatisfiedBy(fixture.createAhdsrDefinition())).toBe(true);
      expect(specification.isSatisfiedBy(fixture.createArDefinition())).toBe(true);
      expect(specification.isSatisfiedBy(fixture.createAsrDefinition())).toBe(true);
      expect(specification.isSatisfiedBy(fixture.createOneShotDefinition())).toBe(true);
    });

    it("should validate gate velocity values", () => {
      const specification = new EnvelopeVelocitySpecification();

      expect(specification.isSatisfiedBy(0)).toBe(true);
      expect(specification.isSatisfiedBy(0.5)).toBe(true);
      expect(specification.isSatisfiedBy(1)).toBe(true);
      expect(specification.isSatisfiedBy(1.1)).toBe(false);
    });
  });

  describe("validator", () => {
    it("should allow valid envelope definitions", () => {
      const fixture = new EnvelopeContractsFixture();
      const validator = EnvelopeDefinitionValidator.createDefault();

      expect(() => validator.validate(fixture.createAdsrDefinition())).not.toThrow();
    });

    it("should reject invalid envelope definitions", () => {
      const fixture = new EnvelopeContractsFixture();
      const validator = EnvelopeDefinitionValidator.createDefault();

      const invalid = {
        ...fixture.createAdsrDefinition(),
        releaseSeconds: -1,
      };

      expect(() => validator.validate(invalid)).toThrow("Envelope definition is invalid");
    });
  });

  describe("runtime contracts", () => {
    it("should allow an envelope implementation to follow the contract", () => {
      const fixture = new EnvelopeContractsFixture();
      const envelope = new TestEnvelope(fixture.createAdsrDefinition());

      envelope.gateOn({
        timeSeconds: 0,
        velocity: 0.8,
      });

      expect(envelope.sample({ timeSeconds: 0.1 }).level).toBe(0.8);
      expect(envelope.snapshot().isGateOpen).toBe(true);
      expect(envelope.snapshot().stage).toBe(EnvelopeStage.Attack);

      envelope.gateOff({
        timeSeconds: 0.5,
      });

      expect(envelope.snapshot().isGateOpen).toBe(false);
      expect(envelope.snapshot().stage).toBe(EnvelopeStage.Release);

      envelope.reset();

      expect(envelope.snapshot().stage).toBe(EnvelopeStage.Idle);
      expect(envelope.snapshot().currentLevel).toBe(0);
    });

    it("should allow an envelope factory implementation to create envelopes", () => {
      const fixture = new EnvelopeContractsFixture();
      const factory = new TestEnvelopeFactory();

      const envelope = factory.create(fixture.createAdsrDefinition());

      expect(envelope.definition.kind).toBe(EnvelopeKind.Adsr);
    });
  });
});
