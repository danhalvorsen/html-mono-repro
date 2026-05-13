import { Vector2 } from "@monorepo/core-math";
import type { CollisionObject } from "./CollisionObject.ts";

export type CollisionResult = Readonly<{
  readonly correctedPosition: Vector2;
  readonly hitHorizontalEdge: boolean;
  readonly hitVerticalEdge: boolean;
}>;

export class CollisionDetection {
  public detectInside(
    movingObject: CollisionObject,
    container: CollisionObject,
  ): CollisionResult {
    let correctedX = movingObject.position.x;
    let correctedY = movingObject.position.y;

    let hitHorizontalEdge = false;
    let hitVerticalEdge = false;

    if (movingObject.left <= container.left) {
      correctedX = container.left;
      hitHorizontalEdge = true;
    }

    if (movingObject.right >= container.right) {
      correctedX = container.right - movingObject.size.x;
      hitHorizontalEdge = true;
    }

    if (movingObject.top <= container.top) {
      correctedY = container.top;
      hitVerticalEdge = true;
    }

    if (movingObject.bottom >= container.bottom) {
      correctedY = container.bottom - movingObject.size.y;
      hitVerticalEdge = true;
    }

    return {
      correctedPosition: new Vector2(correctedX, correctedY),
      hitHorizontalEdge,
      hitVerticalEdge,
    };
  }
}
