// ====================================================================================
// FILE: packages/core-math-constraints/tests/fixtures/PlacementSpecificationFixture.ts
// PURPOSE:
// - Consolidated fixture for placement specifications
// - Replaces:
//   - ObjectFitsInsideWallSpecificationFixture
//   - SourceFitsInsideTargetSpecificationFixture
//   - PlacementScenariosFixture
// ====================================================================================

import { BoundingBox2D, Vector2 } from "@monorepo/core-math";
import type { IPlacementContext } from "../../src/contracts/IPlacementContext.js";
import { SourceFitsInsideTargetSpecification } from "../../src/specifications/source/SourceFitsInsideTargetSpecification.js";
import { SourceBoundaryFitsInsideTargetSpecification } from "../../src/specifications/SourceBoundaryFitsInsideTargetSpecification.js";
import { ISourceBoundaryPlacementContext } from "core-math-constraints/src/contracts/source/ISourceBoundaryPlacementContext.js";

export class PlacementSpecificationFixture {
  public createSourceFitsInsideTargetSpecification(): SourceFitsInsideTargetSpecification {
    return new SourceFitsInsideTargetSpecification();
  }

  public createSourceBoundaryFitsInsideTargetSpecification(): SourceBoundaryFitsInsideTargetSpecification {
    return new SourceBoundaryFitsInsideTargetSpecification();
  }

  public createWallTarget(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(0, 0), new Vector2(10, 6));
  }

  public createValidPlacementTarget(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(2, 1), new Vector2(8, 5));
  }

  public createSourceInsideWall(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(2, 2), new Vector2(4, 4));
  }

  public createSourceInsideValidPlacement(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(3, 2), new Vector2(6, 4));
  }

  public createSourceInsideWallButOutsideValidPlacement(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(0.5, 2), new Vector2(1.5, 4));
  }

  public createSourceTouchingTargetEdges(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(8, 4), new Vector2(10, 6));
  }

  public createSourcePartiallyOverlappingTarget(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(9, 2), new Vector2(11, 4));
  }

  public createSourceOutsideLeftBoundary(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(-1, 2), new Vector2(2, 4));
  }

  public createSourceOutsideRightBoundary(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(9, 2), new Vector2(11, 4));
  }

  public createSourceOutsideBottomBoundary(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(2, -1), new Vector2(4, 1));
  }

  public createSourceOutsideTopBoundary(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(2, 5), new Vector2(4, 7));
  }

  public createSourceLargerThanWall(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(-1, -1), new Vector2(11, 7));
  }

  public createSourceExactMatch(target: BoundingBox2D): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(target.min.x, target.min.y),
      new Vector2(target.max.x, target.max.y),
    );
  }

  public createSourceNearTargetEdge(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(8.5, 2), new Vector2(9.5, 4));
  }

  public createSourceBoundaryThatFits(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(8, 1.5), new Vector2(10, 4.5));
  }

  public createSourceBoundaryThatDoesNotFit(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(8, 1.5), new Vector2(10.5, 4.5));
  }

  public createSourceBoundaryExactMatch(target: BoundingBox2D): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(target.min.x, target.min.y),
      new Vector2(target.max.x, target.max.y),
    );
  }

  public createPlacementContext(source: BoundingBox2D, target: BoundingBox2D): IPlacementContext {
    return { source, target };
  }

  public createSourceBoundaryPlacementContext(
    source: BoundingBox2D,
    sourceBoundary: BoundingBox2D,
    target: BoundingBox2D,
  ): ISourceBoundaryPlacementContext {
    return { source, sourceBoundary, target };
  }
}
