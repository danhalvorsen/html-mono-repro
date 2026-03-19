// ====================================================================================
// FILE: packages/core-math-constraints/tests/PlacementScenarios.test.ts
// ====================================================================================

import { describe, expect, it } from "vitest";
import { PlacementScenariosFixture } from "./fixture/PlacementScenariosFixture.js";

describe("an object must be fully contained within its target area", () => {
  const fixture = new PlacementScenariosFixture();

  describe("given a wall as the target area", () => {
    it("when the object is fully inside the wall, then placement is valid", () => {
      const sut = fixture.createSourceFitsInsideTargetSut();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceInsideWall(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(true);
    });

    it("when the object exactly matches the wall boundaries, then placement is valid", () => {
      const sut = fixture.createSourceFitsInsideTargetSut();
      const target = fixture.createWallTarget();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceExact(target),
          target,
        ),
      );

      expect(actual).toBe(true);
    });

    it("when the object touches the wall edges without crossing them, then placement is valid", () => {
      const sut = fixture.createSourceFitsInsideTargetSut();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceTouchingRightAndTopEdge(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(true);
    });

    it("when the object crosses the left wall boundary, then placement is invalid", () => {
      const sut = fixture.createSourceFitsInsideTargetSut();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceOutsideLeft(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(false);
    });

    it("when the object crosses the bottom wall boundary, then placement is invalid", () => {
      const sut = fixture.createSourceFitsInsideTargetSut();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceOutsideBottom(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(false);
    });

    it("when the object crosses the top wall boundary, then placement is invalid", () => {
      const sut = fixture.createSourceFitsInsideTargetSut();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceOutsideTop(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(false);
    });

    it("when the object only partially overlaps the wall, then placement is invalid", () => {
      const sut = fixture.createSourceFitsInsideTargetSut();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourcePartialOverlapRight(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(false);
    });

    it("when the object is larger than the wall, then placement is invalid", () => {
      const sut = fixture.createSourceFitsInsideTargetSut();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceLargerThanWall(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(false);
    });
  });

  describe("given a valid placement area inside the wall", () => {
    it("when the object is fully inside the valid placement area, then placement is valid", () => {
      const sut = fixture.createSourceFitsInsideTargetSut();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceInsideValidPlacement(),
          fixture.createValidPlacementTarget(),
        ),
      );

      expect(actual).toBe(true);
    });

    it("when the object is inside the wall but outside the valid placement area, then placement is invalid", () => {
      const sut = fixture.createSourceFitsInsideTargetSut();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceInsideWallButOutsideValidPlacement(),
          fixture.createValidPlacementTarget(),
        ),
      );

      expect(actual).toBe(false);
    });
  });

  describe("given an object with a required safety boundary", () => {
    it("when the safety boundary is fully inside the wall, then placement is valid", () => {
      const sut = fixture.createSourceBoundaryFitsInsideTargetSut();

      const actual = sut.isSatisfiedBy(
        fixture.createSourceBoundaryPlacementContext(
          fixture.createSourceNearEdge(),
          fixture.createSourceBoundaryThatFits(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(true);
    });

    it("when the object fits but the safety boundary crosses the wall, then placement is invalid", () => {
      const sut = fixture.createSourceBoundaryFitsInsideTargetSut();

      const actual = sut.isSatisfiedBy(
        fixture.createSourceBoundaryPlacementContext(
          fixture.createSourceNearEdge(),
          fixture.createSourceBoundaryThatDoesNotFit(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(false);
    });

    it("when the safety boundary exactly matches the wall boundaries, then placement is valid", () => {
      const sut = fixture.createSourceBoundaryFitsInsideTargetSut();
      const target = fixture.createWallTarget();

      const actual = sut.isSatisfiedBy(
        fixture.createSourceBoundaryPlacementContext(
          fixture.createSourceInsideWall(),
          fixture.createSourceBoundaryExactMatch(target),
          target,
        ),
      );

      expect(actual).toBe(true);
    });
  });

  describe("given the rule is inverted", () => {
    it("when the object is inside the wall, then placement is invalid", () => {
      const sut = fixture.createSourceFitsInsideTargetSut().not();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceInsideWall(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(false);
    });

    it("when the object is outside the wall, then placement is valid", () => {
      const sut = fixture.createSourceFitsInsideTargetSut().not();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceOutsideLeft(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(true);
    });
  });
});