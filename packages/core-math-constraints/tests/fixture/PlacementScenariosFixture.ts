import { BoundingBox2D, Vector2 } from "@monorepo/core-math";
import { SourceBoundaryFitsInsideTargetSpecification } from "../../src/specifications/SourceBoundaryFitsInsideTargetSpecification.js";
import { SourceFitsInsideTargetSpecification } from "../../src/specifications/source/SourceFitsInsideTargetSpecification.js";
import { IPlacementContext } from "core-math-constraints/src/contracts/IPlacementContext.js";
import { ISourceBoundaryPlacementContext } from "core-math-constraints/src/contracts/source/ISourceBoundaryPlacementContext.js";

export class PlacementScenariosFixture {
  public createSourceFitsInsideTargetSut(): SourceFitsInsideTargetSpecification {
    return new SourceFitsInsideTargetSpecification();
  }

  public createSourceBoundaryFitsInsideTargetSut(): SourceBoundaryFitsInsideTargetSpecification {
    return new SourceBoundaryFitsInsideTargetSpecification();
  }
  public createSourceBoundaryExactMatch(target: BoundingBox2D): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(target.min.x, target.min.y),
      new Vector2(target.max.x, target.max.y),
    );
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

  public createSourceTouchingRightAndTopEdge(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(8, 4), new Vector2(10, 6));
  }

  public createSourcePartialOverlapRight(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(9, 2), new Vector2(11, 4));
  }

  public createSourceOutsideLeft(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(-1, 2), new Vector2(2, 4));
  }

  public createSourceOutsideBottom(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(2, -1), new Vector2(4, 1));
  }

  public createSourceOutsideTop(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(2, 5), new Vector2(4, 7));
  }

  public createSourceLargerThanWall(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(-1, -1), new Vector2(11, 7));
  }

  public createSourceExact(target: BoundingBox2D): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(target.min.x, target.min.y),
      new Vector2(target.max.x, target.max.y),
    );
  }

  public createSourceNearEdge(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(8.5, 2), new Vector2(9.5, 4));
  }

  public createSourceBoundaryThatFits(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(8, 1.5), new Vector2(10, 4.5));
  }

  public createSourceBoundaryThatDoesNotFit(): BoundingBox2D {
    return new BoundingBox2D(new Vector2(8, 1.5), new Vector2(10.5, 4.5));
  }

  public createPlacementContext(
    source: BoundingBox2D,
    target: BoundingBox2D,
  ): IPlacementContext {
    return {
      source,
      target,
    };
  }

  public createSourceBoundaryPlacementContext(
    source: BoundingBox2D,
    sourceBoundary: BoundingBox2D,
    target: BoundingBox2D,
  ): ISourceBoundaryPlacementContext {
    return {
      source,
      sourceBoundary,
      target,
    };
  }
}
