// ====================================================================================
// FILE: packages/core-math-constraints/tests/fixtures/SourceFitsInsideOneOfManyAreasFixture.ts
// ====================================================================================

import { BoundingBox2D, Vector2 } from "@monorepo/core-math";

export interface ISourceOnlyPlacementContext {
  readonly source: BoundingBox2D;
}

export class SourceFitsInsideOneOfManyAreasFixture {
  public createSmallArea(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(0, 0),
      new Vector2(2, 2),
    );
  }

  public createLargeArea(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(5, 0),
      new Vector2(10, 6),
    );
  }

  public createSourceThatDoesNotFitSmallAreaButFitsLargeArea(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(6, 1),
      new Vector2(9, 4),
    );
  }

  public createSourceThatFitsNeitherArea(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(20, 20),
      new Vector2(25, 25),
    );
  }

  public createContext(source: BoundingBox2D): ISourceOnlyPlacementContext {
    return { source };
  }
}