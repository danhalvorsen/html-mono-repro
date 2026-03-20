// ====================================================================================
// FILE: tests/FitsWithinFixedAreaSpecification.test.ts
// ====================================================================================

import { describe, expect, it } from "vitest";
import { FitsWithinFixedAreaSpecification } from "../src/specifications/FitsWithinFixedAreaSpecification.js";
import { PlacementFixture } from "./fixture/PlacementFixture.js";

class FitsWithinFixedAreaFixture {
  private readonly base = new PlacementFixture();

  public valid() {
    const source = this.base.createSource(1, 1, 3, 3);
    const area = this.base.createTarget(0, 0, 10, 10);

    return { source, area };
  }

  public invalid_OutOfBounds() {
    const source = this.base.createSource(9, 9, 12, 12);
    const area = this.base.createTarget(0, 0, 10, 10);

    return { source, area };
  }

  public exactFit() {
    const source = this.base.createSource(0, 0, 10, 10);
    const area = this.base.createTarget(0, 0, 10, 10);

    return { source, area };
  }

  public boundaryTouch() {
    const source = this.base.createSource(0, 0, 5, 5);
    const area = this.base.createTarget(0, 0, 5, 5);

    return { source, area };
  }
}

describe("Rule: source must be fully contained within a fixed area (inclusive boundaries)", () => {
  const fixture = new FitsWithinFixedAreaFixture();

  describe("given a fixed area", () => {
    it("when source is fully inside, then the rule is satisfied", () => {
      const { source, area } = fixture.valid();
      const sut = new FitsWithinFixedAreaSpecification(area);

      expect(sut.isSatisfiedBy({ source })).toBe(true);
    });

    it("when source exceeds bounds, then the rule is not satisfied", () => {
      const { source, area } = fixture.invalid_OutOfBounds();
      const sut = new FitsWithinFixedAreaSpecification(area);

      expect(sut.isSatisfiedBy({ source })).toBe(false);
    });

    it("when source exactly matches area, then the rule is satisfied", () => {
      const { source, area } = fixture.exactFit();
      const sut = new FitsWithinFixedAreaSpecification(area);

      expect(sut.isSatisfiedBy({ source })).toBe(true);
    });

    it("when source touches boundary but stays inside, then the rule is satisfied", () => {
      const { source, area } = fixture.boundaryTouch();
      const sut = new FitsWithinFixedAreaSpecification(area);

      expect(sut.isSatisfiedBy({ source })).toBe(true);
    });
  });
});