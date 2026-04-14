// tests/StrictAdsrEnvelope.Start-A.spec.ts

import { AttackMustBeAtPeakSpecification, 
  SegmentDirectionsMustMatchStrictAdsrShapeSpecification,
   StartMustBeOriginSpecification, StrictAdsrEnvelope, 
   XCoordinatesMustBeStrictAdsrOrderedSpecification } from "../../../src/envelops/ADSR/index.js";
import type { Point2 } from "@monorepo/core-math";
import { describe, expect, it } from "vitest";

class StrictAdsrEnvelopeFixture {
  public createValid(): StrictAdsrEnvelope {
    return {
      start: { x: 0, y: 0 },
      attack: { x: 0.2, y: 1 },
      decay: { x: 0.4, y: 0.5 },
      sustain: { x: 0.7, y: 0.5 },
      end: { x: 1, y: 0 },
    };
  }

  public withStart(point: Point2): StrictAdsrEnvelope {
    return {
      ...this.createValid(),
      start: point,
    };
  }

  public withAttack(point: Point2): StrictAdsrEnvelope {
    return {
      ...this.createValid(),
      attack: point,
    };
  }

  public withStartAndAttack(start: Point2, attack: Point2): StrictAdsrEnvelope {
    return {
      ...this.createValid(),
      start,
      attack,
    };
  }
}

describe("StartMustBeOriginSpecification", () => {
  const fixture = new StrictAdsrEnvelopeFixture();
  const sut = new StartMustBeOriginSpecification();

  it("should create a valid result when start is at origin", () => {
    const candidate = fixture.createValid();

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(true);
  });

  it("should reject invalid state when start x is not zero", () => {
    const candidate = fixture.withStart({ x: 0.1, y: 0 });

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(false);
  });

  it("should reject invalid state when start y is not zero", () => {
    const candidate = fixture.withStart({ x: 0, y: 0.1 });

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(false);
  });

  it("should reject invalid state when start is not origin", () => {
    const candidate = fixture.withStart({ x: 0.1, y: 0.2 });

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(false);
  });
});

describe("AttackMustBeAtPeakSpecification", () => {
  const fixture = new StrictAdsrEnvelopeFixture();
  const sut = new AttackMustBeAtPeakSpecification();

  it("should create a valid result when attack y is one", () => {
    const candidate = fixture.createValid();

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(true);
  });

  it("should reject invalid state when attack y is below peak", () => {
    const candidate = fixture.withAttack({ x: 0.2, y: 0.9 });

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(false);
  });

  it("should reject invalid state when attack y is above normalized peak", () => {
    const candidate = fixture.withAttack({ x: 0.2, y: 1.1 });

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(false);
  });
});

describe("XCoordinatesMustBeStrictAdsrOrderedSpecification start-to-attack", () => {
  const fixture = new StrictAdsrEnvelopeFixture();
  const sut = new XCoordinatesMustBeStrictAdsrOrderedSpecification();

  it("should create a valid result when start x is before attack x", () => {
    const candidate = fixture.createValid();

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(true);
  });

  it("should reject invalid state when attack x equals start x", () => {
    const candidate = fixture.withStartAndAttack(
      { x: 0, y: 0 },
      { x: 0, y: 1 },
    );

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(false);
  });

  it("should reject invalid state when attack x is before start x", () => {
    const candidate = fixture.withStartAndAttack(
      { x: 0.1, y: 0 },
      { x: 0.05, y: 1 },
    );

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(false);
  });
});

describe("SegmentDirectionsMustMatchStrictAdsrShapeSpecification start-to-attack", () => {
  const fixture = new StrictAdsrEnvelopeFixture();
  const sut = new SegmentDirectionsMustMatchStrictAdsrShapeSpecification();

  it("should create a valid result when start-to-attack rises", () => {
    const candidate = fixture.createValid();

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(true);
  });

  it("should reject invalid state when attack y does not rise above start y", () => {
    const candidate = fixture.withStartAndAttack(
      { x: 0, y: 0 },
      { x: 0.2, y: 0 },
    );

    const result = sut.isSatisfiedBy(candidate);

    expect(result).toBe(false);
  });
});
