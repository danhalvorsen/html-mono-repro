
// ====================================================================================
// FILE: packages/core-math-constraints/tests/fixtures/ObjectFitsInsideWallSpecificationFixture.ts
// ====================================================================================

import { AABB2, Vector2 } from "@monorepo/core-math";
import type { IObjectPlacementContext } from "../../src/contracts/IObjectPlacementContext.js";
import { ObjectFitsInsideWallSpecification } from "../../src/specifications/ObjectFitsInsideWallSpecification.js";

export class ObjectFitsInsideWallSpecificationFixture {
  public createSut(): ObjectFitsInsideWallSpecification {
    return new ObjectFitsInsideWallSpecification();
  }

  public createWallRect(): AABB2 {
    return new AABB2(
      new Vector2(0, 0),
      new Vector2(10, 6),
    );
  }

  public createObjectRectInsideWall(): AABB2 {
    return new AABB2(
      new Vector2(2, 1),
      new Vector2(5, 4),
    );
  }

  public createObjectRectTouchingWallEdges(): AABB2 {
    return new AABB2(
      new Vector2(0, 0),
      new Vector2(10, 6),
    );
  }

  public createObjectRectOutsideLeftEdge(): AABB2 {
    return new AABB2(
      new Vector2(-1, 1),
      new Vector2(3, 4),
    );
  }

  public createObjectRectOutsideBottomEdge(): AABB2 {
    return new AABB2(
      new Vector2(1, -1),
      new Vector2(3, 2),
    );
  }

  public createObjectRectOutsideRightEdge(): AABB2 {
    return new AABB2(
      new Vector2(8, 1),
      new Vector2(11, 4),
    );
  }

  public createObjectRectOutsideTopEdge(): AABB2 {
    return new AABB2(
      new Vector2(1, 4),
      new Vector2(4, 7),
    );
  }

  public createContext(
    objectRect: AABB2,
    wallRect: AABB2 = this.createWallRect(),
  ): IObjectPlacementContext {
    return {
      objectRect,
      wallRect,
    };
  }
}