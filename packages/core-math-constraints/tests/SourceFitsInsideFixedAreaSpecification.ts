// ====================================================================================
// FILE: packages/core-math-constraints/tests/specifications/SourceFitsInsideOneOfManyAreasSpecification.test.ts
// ====================================================================================

import { describe, expect, it } from "vitest";
import { Specification } from "@monorepo/core-specifications";
import type { BoundingBox2D } from "@monorepo/core-math";
  
import { ISourceOnlyPlacementContext, SourceFitsInsideOneOfManyAreasFixture } from "./fixture/SourceFitsInsideOneOfManyAreasFixture.js";
class SourceFitsInsideFixedAreaSpecification
  extends Specification<ISourceOnlyPlacementContext>
{
  public constructor(
    private readonly area: BoundingBox2D,
  ) {
    super();
  }

  public override isSatisfiedBy(context: ISourceOnlyPlacementContext): boolean {
    return this.area.containsBox(context.source);
  }
}

describe("an object may be placed in any one of several valid placement areas", () => {
  const fixture = new SourceFitsInsideOneOfManyAreasFixture();

  it("when the object does not fit in the first area but fits in the second area, then placement is valid", () => {
    const smallAreaSpecification = new SourceFitsInsideFixedAreaSpecification(
      fixture.createSmallArea(),
    );

    const largeAreaSpecification = new SourceFitsInsideFixedAreaSpecification(
      fixture.createLargeArea(),
    );

    const specification = smallAreaSpecification.or(largeAreaSpecification);

    const actual = specification.isSatisfiedBy(
      fixture.createContext(
        fixture.createSourceThatDoesNotFitSmallAreaButFitsLargeArea(),
      ),
    );

    expect(actual).toBe(true);
  });

  it("when the object fits in none of the valid placement areas, then placement is invalid", () => {
    const smallAreaSpecification = new SourceFitsInsideFixedAreaSpecification(
      fixture.createSmallArea(),
    );

    const largeAreaSpecification = new SourceFitsInsideFixedAreaSpecification(
      fixture.createLargeArea(),
    );

    const specification = smallAreaSpecification.or(largeAreaSpecification);

    const actual = specification.isSatisfiedBy(
      fixture.createContext(
        fixture.createSourceThatFitsNeitherArea(),
      ),
    );

    expect(actual).toBe(false);
  });
});