// ====================================================================================
// FILE: tests/FitsWithinTargetSpecification.test.ts
// ====================================================================================

import { FitsWithinTargetSpecification } from "../src/index.js";
import { describe, expect, it } from "vitest";
import { PlacementFixture } from "./fixture/PlacementFixture.js";
 
class FitsWithinTargetFixture {
  private readonly base = new PlacementFixture();

  public valid() {
    const source = this.base.createSource(1, 1, 3, 3);
    const target = this.base.createTarget(0, 0, 10, 10);
    return this.base.createContext(source, target);
  }

  public invalid_OutOfBounds() {
    const source = this.base.createSource(9, 9, 12, 12);
    const target = this.base.createTarget(0, 0, 10, 10);
    return this.base.createContext(source, target);
  }

  public exactFit() {
    const source = this.base.createSource(0, 0, 10, 10);
    const target = this.base.createTarget(0, 0, 10, 10);
    return this.base.createContext(source, target);
  }

  public boundaryTouch() {
    const source = this.base.createSource(0, 0, 5, 5);
    const target = this.base.createTarget(0, 0, 5, 5);
    return this.base.createContext(source, target);
  }
}

describe("Rule: source must be fully contained within target (inclusive boundaries)", () => {
  const sut = new FitsWithinTargetSpecification();
  const fixture = new FitsWithinTargetFixture();

  describe("given placement scenarios", () => {
    it("when source is fully inside, then the rule is satisfied", () => {
      expect(sut.isSatisfiedBy(fixture.valid())).toBe(true);
    });

    it("when source exceeds bounds, then the rule is not satisfied", () => {
      expect(sut.isSatisfiedBy(fixture.invalid_OutOfBounds())).toBe(false);
    });

    it("when source exactly matches target, then the rule is satisfied", () => {
      expect(sut.isSatisfiedBy(fixture.exactFit())).toBe(true);
    });

    it("when source touches boundary but stays inside, then the rule is satisfied", () => {
      expect(sut.isSatisfiedBy(fixture.boundaryTouch())).toBe(true);
    });
  });
});