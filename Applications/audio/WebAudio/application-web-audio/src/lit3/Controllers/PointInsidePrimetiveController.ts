// ====================================================================================
// FILE: src/lit3/Controllers/PointInsidePrimitiveController.ts
// ====================================================================================

import { Vector2 } from "@monorepo/core-math";
import type { ReactiveController, ReactiveControllerHost } from "lit";

export class PointInsidePrimitiveController implements ReactiveController {
  public constructor(private readonly host: ReactiveControllerHost) {
    this.host.addController(this);
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
}