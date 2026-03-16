// Applications/audio/WebAudio/application-web-audio/tests/fixtures/DragControllerFixture.ts

import { Point } from "@monorepo/core-math";
import {
  DragController,
 
} from "../../src/index.js";
import { TestDraggable } from "./TestDraggable.js";
 
if (!customElements.get("test-draggable")) {
  customElements.define("test-draggable", TestDraggable);
}

export class FakeMouseController {
  public constructor(
    private readonly controller: DragController,
  ) {}

  public down(point: Point): this {
    this.controller.onPointerDown(point);
    return this;
  }

  public move(point: Point): this {
    this.controller.onPointerMove(point);
    return this;
  }

  public up(): this {
    this.controller.onPointerUp();
    return this;
  }

  public leave(): this {
    this.controller.onPointerLeave();
    return this;
  }

  public click(point: Point): this {
    return this.down(point).up();
  }

  public drag(from: Point, to: Point, steps: number = 1): this {
    const normalizedSteps = Math.max(1, Math.floor(steps));

    this.down(from);

    for (let index = 1; index <= normalizedSteps; index++) {
      const t = index / normalizedSteps;

      this.move({
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      });
    }

    this.up();
    return this;
  }
}

