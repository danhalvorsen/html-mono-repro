// ====================================================================================
// FILE: src/lit3/Controllers/PointInsidePrimitiveController.ts
// ====================================================================================

import { Vector2 } from "@monorepo/core-math";
import type { ReactiveController, ReactiveControllerHost } from "lit";

export class PointInsidePrimitiveController implements ReactiveController {
  public constructor(host?: ReactiveControllerHost) {
    host?.addController(this);
  }

  public hostConnected(): void {}

  public hostDisconnected(): void {}

  public pointInsideRect(
    point: Vector2,
    position: Vector2,
    width: number,
    height: number,
  ): boolean {
    return (
      point.x >= position.x &&
      point.x <= position.x + width &&
      point.y >= position.y &&
      point.y <= position.y + height
    );
  }

  public pointInsideCircle(
    point: Vector2,
    center: Vector2,
    radius: number,
  ): boolean {
    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return dx * dx + dy * dy <= radius * radius;
  }

  public pointNearLineSegment(
    point: Vector2,
    start: Vector2,
    end: Vector2,
    tolerance: number,
  ): boolean {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return false;
    }

    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared,
      ),
    );

    const closestX = start.x + t * dx;
    const closestY = start.y + t * dy;
    const distance = Math.hypot(point.x - closestX, point.y - closestY);

    return distance <= tolerance;
  }

  public pointInsidePolygon(
    point: Vector2,
    vertices: readonly Vector2[],
  ): boolean {
    if (vertices.length < 3) {
      return false;
    }

    let inside = false;

    for (
      let index = 0, previous = vertices.length - 1;
      index < vertices.length;
      previous = index++
    ) {
      const current = vertices[index]!;
      const prior = vertices[previous]!;

      const intersects =
        current.y > point.y !== prior.y > point.y &&
        point.x <
          ((prior.x - current.x) * (point.y - current.y)) /
            (prior.y - current.y) +
            current.x;

      if (intersects) {
        inside = !inside;
      }
    }

    return inside;
  }
}
