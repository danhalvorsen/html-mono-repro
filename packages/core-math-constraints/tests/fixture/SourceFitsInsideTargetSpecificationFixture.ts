// ====================================================================================
// FILE: packages/core-math-constraints/tests/fixtures/SourceFitsInsideTargetSpecificationFixture.ts
// ====================================================================================

import { BoundingBox2D, Vector2 } from "@monorepo/core-math";
import type { IPlacementContext } from "../../src/contracts/IPlacementContext.js";
import { SourceFitsInsideTargetSpecification } from "../../src/specifications/source/SourceFitsInsideTargetSpecification.js";

export class SourceFitsInsideTargetSpecificationFixture {
  public createSut(): SourceFitsInsideTargetSpecification {
    return new SourceFitsInsideTargetSpecification();
  }

  public createWallTarget(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(0, 0),
      new Vector2(10, 6),
    );
  }

  public createValidPlacementTarget(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(2, 1),
      new Vector2(8, 5),
    );
  }

  public createSourceInsideWall(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(2, 2),
      new Vector2(4, 4),
    );
  }

  public createSourceInsideValidPlacement(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(3, 2),
      new Vector2(6, 4),
    );
  }

  public createSourceInsideWallButOutsideValidPlacement(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(0.5, 2),
      new Vector2(1.5, 4),
    );
  }

  public createSourceExact(target: BoundingBox2D): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(target.min.x, target.min.y),
      new Vector2(target.max.x, target.max.y),
    );
  }

  public createSourceOutsideLeft(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(-1, 2),
      new Vector2(2, 4),
    );
  }

  public createSourceOutsideRight(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(9, 2),
      new Vector2(11, 4),
    );
  }

  public createSourceOutsideBottom(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(2, -1),
      new Vector2(4, 1),
    );
  }

  public createSourceOutsideTop(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(2, 5),
      new Vector2(4, 7),
    );
  }

  public createSourceCrossingLeftBoundaryOfValidPlacement(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(1.5, 2),
      new Vector2(3, 4),
    );
  }

  public createSourceCrossingRightBoundaryOfValidPlacement(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(7.5, 2),
      new Vector2(8.5, 4),
    );
  }

  public createSourceCrossingBottomBoundaryOfValidPlacement(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(3, 0.5),
      new Vector2(5, 2),
    );
  }

  public createSourceCrossingTopBoundaryOfValidPlacement(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(3, 4.5),
      new Vector2(5, 5.5),
    );
  }

  public createContext(
    source: BoundingBox2D,
    target: BoundingBox2D,
  ): IPlacementContext {
    return { source, target };
  }
}
