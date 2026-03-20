// ====================================================================================
// FILE: tests/FitsWithinAnyAreaSpecification.test.ts
// ====================================================================================

import { describe, expect, it } from "vitest";

import { PlacementFixture } from "./fixture/PlacementFixture.js";
import { FitsWithinAnyAreaSpecification } from "../src/index.js";
class FitsWithinAnyAreaFixture {
  private readonly base = new PlacementFixture();

  public valid_InSecondArea() {
    const source = this.base.createSource(20, 20, 24, 24);
    const area1 = this.base.createTarget(0, 0, 2, 2);
    const area2 = this.base.createTarget(10, 10, 30, 30);

    return {
      source,
      areas: [area1, area2] as const,
    };
  }

  public invalid_InNoArea() {
    const source = this.base.createSource(40, 40, 50, 50);
    const area1 = this.base.createTarget(0, 0, 2, 2);
    const area2 = this.base.createTarget(10, 10, 30, 30);

    return {
      source,
      areas: [area1, area2] as const,
    };
  }

  public valid_InFirstArea() {
    const source = this.base.createSource(1, 1, 2, 2);
    const area1 = this.base.createTarget(0, 0, 5, 5);
    const area2 = this.base.createTarget(10, 10, 30, 30);

    return {
      source,
      areas: [area1, area2] as const,
    };
  }

  public exactFit_InOneArea() {
    const source = this.base.createSource(10, 10, 20, 20);
    const area1 = this.base.createTarget(0, 0, 5, 5);
    const area2 = this.base.createTarget(10, 10, 20, 20);

    return {
      source,
      areas: [area1, area2] as const,
    };
  }
}

describe("Rule: source must be fully contained within at least one area (OR semantics)", () => {
  const fixture = new FitsWithinAnyAreaFixture();

  describe("given multiple candidate areas", () => {
    it("when source fits within the second area, then the rule is satisfied", () => {
      const { source, areas } = fixture.valid_InSecondArea();
      const sut = new FitsWithinAnyAreaSpecification(areas);

      expect(sut.isSatisfiedBy({ source })).toBe(true);
    });

    it("when source fits within no area, then the rule is not satisfied", () => {
      const { source, areas } = fixture.invalid_InNoArea();
      const sut = new FitsWithinAnyAreaSpecification(areas);

      expect(sut.isSatisfiedBy({ source })).toBe(false);
    });

    it("when source fits within the first area, then the rule is satisfied", () => {
      const { source, areas } = fixture.valid_InFirstArea();
      const sut = new FitsWithinAnyAreaSpecification(areas);

      expect(sut.isSatisfiedBy({ source })).toBe(true);
    });

    it("when source exactly matches one area, then the rule is satisfied", () => {
      const { source, areas } = fixture.exactFit_InOneArea();
      const sut = new FitsWithinAnyAreaSpecification(areas);

      expect(sut.isSatisfiedBy({ source })).toBe(true);
    });
  });
});