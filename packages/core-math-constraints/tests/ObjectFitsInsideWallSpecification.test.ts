// ====================================================================================
// FILE: packages/core-math-constraints/tests/specifications/ObjectFitsInsideWallSpecification.test.ts
// ====================================================================================

import { describe, expect, it } from "vitest";
import { ObjectFitsInsideWallSpecificationFixture } from "./fixture/ObjectFitsInsideWallSpecificationFixture.js";

describe("an object must be fully contained within the wall", () => {
  const fixture = new ObjectFitsInsideWallSpecificationFixture();

  it("when the object rectangle is fully inside the wall rectangle, then the specification is satisfied", () => {
    const sut = fixture.createSut();
    const context = fixture.createContext(
      fixture.createObjectRectInsideWall(),
    );

    const actual = sut.isSatisfiedBy(context);

    expect(actual).toBe(true);
  });

  it("when the object rectangle exactly matches the wall rectangle, then the specification is satisfied", () => {
    const sut = fixture.createSut();
    const context = fixture.createContext(
      fixture.createObjectRectTouchingWallEdges(),
    );

    const actual = sut.isSatisfiedBy(context);

    expect(actual).toBe(true);
  });

  it("when the object rectangle crosses the left wall edge, then the specification is not satisfied", () => {
    const sut = fixture.createSut();
    const context = fixture.createContext(
      fixture.createObjectRectOutsideLeftEdge(),
    );

    const actual = sut.isSatisfiedBy(context);

    expect(actual).toBe(false);
  });

  it("when the object rectangle crosses the bottom wall edge, then the specification is not satisfied", () => {
    const sut = fixture.createSut();
    const context = fixture.createContext(
      fixture.createObjectRectOutsideBottomEdge(),
    );

    const actual = sut.isSatisfiedBy(context);

    expect(actual).toBe(false);
  });

  it("when the object rectangle crosses the right wall edge, then the specification is not satisfied", () => {
    const sut = fixture.createSut();
    const context = fixture.createContext(
      fixture.createObjectRectOutsideRightEdge(),
    );

    const actual = sut.isSatisfiedBy(context);

    expect(actual).toBe(false);
  });

  it("when the object rectangle crosses the top wall edge, then the specification is not satisfied", () => {
    const sut = fixture.createSut();
    const context = fixture.createContext(
      fixture.createObjectRectOutsideTopEdge(),
    );

    const actual = sut.isSatisfiedBy(context);

    expect(actual).toBe(false);
  });
});