
// ====================================================================================
// FILE: packages/core-math-constraints/tests/specifications/SourceFitsInsideTargetSpecification.test.ts
// PURPOSE:
// - Consolidated specification test suite
// - Replaces:
//   - ObjectFitsInsideWallSpecification.test.ts
//   - PlacementScenarios.test.ts
//   - old SourceFitsInsideTargetSpecification.test.ts
// ====================================================================================

import { describe, expect, it } from "vitest";
import { PlacementSpecificationFixture } from "./fixture/PlacementSpecificationFixture.js";
 
describe("SourceFitsInsideTargetSpecification", () => {
  const fixture = new PlacementSpecificationFixture();

  describe("given a wall target", () => {
    it("when the source is fully inside the wall, then the specification should be satisfied", () => {
      const sut = fixture.createSourceFitsInsideTargetSpecification();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceInsideWall(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(true);
    });

    it("when the source exactly matches the wall boundaries, then the specification should be satisfied", () => {
      const sut = fixture.createSourceFitsInsideTargetSpecification();
      const wallTarget = fixture.createWallTarget();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceExactMatch(wallTarget),
          wallTarget,
        ),
      );

      expect(actual).toBe(true);
    });

    it("when the source touches the wall edges without crossing them, then the specification should be satisfied", () => {
      const sut = fixture.createSourceFitsInsideTargetSpecification();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceTouchingTargetEdges(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(true);
    });

    it("when the source crosses the left wall boundary, then the specification should not be satisfied", () => {
      const sut = fixture.createSourceFitsInsideTargetSpecification();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceOutsideLeftBoundary(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(false);
    });

    it("when the source crosses the right wall boundary, then the specification should not be satisfied", () => {
      const sut = fixture.createSourceFitsInsideTargetSpecification();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceOutsideRightBoundary(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(false);
    });

    it("when the source crosses the bottom wall boundary, then the specification should not be satisfied", () => {
      const sut = fixture.createSourceFitsInsideTargetSpecification();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceOutsideBottomBoundary(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(false);
    });

    it("when the source crosses the top wall boundary, then the specification should not be satisfied", () => {
      const sut = fixture.createSourceFitsInsideTargetSpecification();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceOutsideTopBoundary(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(false);
    });

    it("when the source is larger than the wall, then the specification should not be satisfied", () => {
      const sut = fixture.createSourceFitsInsideTargetSpecification();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceLargerThanWall(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(false);
    });

    it("when the source only partially overlaps the wall, then the specification should not be satisfied", () => {
      const sut = fixture.createSourceFitsInsideTargetSpecification();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourcePartiallyOverlappingTarget(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(false);
    });
  });

  describe("given a valid placement target inside the wall", () => {
    it("when the source is fully inside the valid placement area, then the specification should be satisfied", () => {
      const sut = fixture.createSourceFitsInsideTargetSpecification();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceInsideValidPlacement(),
          fixture.createValidPlacementTarget(),
        ),
      );

      expect(actual).toBe(true);
    });

    it("when the source is inside the wall but outside the valid placement area, then the specification should not be satisfied", () => {
      const sut = fixture.createSourceFitsInsideTargetSpecification();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceInsideWallButOutsideValidPlacement(),
          fixture.createValidPlacementTarget(),
        ),
      );

      expect(actual).toBe(false);
    });
  });

  describe("given the specification is inverted", () => {
    it("when the source is inside the wall target, then the inverted specification should not be satisfied", () => {
      const sut = fixture.createSourceFitsInsideTargetSpecification().not();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceInsideWall(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(false);
    });

    it("when the source is outside the wall target, then the inverted specification should be satisfied", () => {
      const sut = fixture.createSourceFitsInsideTargetSpecification().not();

      const actual = sut.isSatisfiedBy(
        fixture.createPlacementContext(
          fixture.createSourceOutsideLeftBoundary(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(true);
    });
  });
});

describe("SourceBoundaryFitsInsideTargetSpecification", () => {
  const fixture = new PlacementSpecificationFixture();

  describe("given a source object with a required safety boundary", () => {
    it("when the source boundary fits inside the target, then the specification should be satisfied", () => {
      const sut = fixture.createSourceBoundaryFitsInsideTargetSpecification();

      const actual = sut.isSatisfiedBy(
        fixture.createSourceBoundaryPlacementContext(
          fixture.createSourceNearTargetEdge(),
          fixture.createSourceBoundaryThatFits(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(true);
    });

    it("when the source fits but the source boundary crosses the target boundary, then the specification should not be satisfied", () => {
      const sut = fixture.createSourceBoundaryFitsInsideTargetSpecification();

      const actual = sut.isSatisfiedBy(
        fixture.createSourceBoundaryPlacementContext(
          fixture.createSourceNearTargetEdge(),
          fixture.createSourceBoundaryThatDoesNotFit(),
          fixture.createWallTarget(),
        ),
      );

      expect(actual).toBe(false);
    });

    it("when the source boundary exactly matches the target, then the specification should be satisfied", () => {
      const sut = fixture.createSourceBoundaryFitsInsideTargetSpecification();
      const wallTarget = fixture.createWallTarget();

      const actual = sut.isSatisfiedBy(
        fixture.createSourceBoundaryPlacementContext(
          fixture.createSourceInsideWall(),
          fixture.createSourceBoundaryExactMatch(wallTarget),
          wallTarget,
        ),
      );

      expect(actual).toBe(true);
    });
  });
});