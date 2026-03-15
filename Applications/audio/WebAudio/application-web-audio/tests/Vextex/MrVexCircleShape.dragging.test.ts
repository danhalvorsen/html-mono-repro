import { afterEach, describe, expect, it } from "vitest";
import type { ReactiveController, ReactiveControllerHost } from "lit";
import { Vector2 } from "@monorepo/core-math";

import "../../src/index.js";
import { DragController, MrDraggable, MrVexCircleShape } from "../../src/index.js";

class TestReactiveHost implements ReactiveControllerHost {
  public readonly updateComplete: Promise<boolean> = Promise.resolve(true);
  private readonly controllers: ReactiveController[] = [];

  public addController(controller: ReactiveController): void {
    this.controllers.push(controller);
  }

  public removeController(controller: ReactiveController): void {
    const index = this.controllers.indexOf(controller);

    if (index >= 0) {
      this.controllers.splice(index, 1);
    }
  }

  public requestUpdate(): void {
    // no-op
  }
}

describe("MrVexCircleShape dragging", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should not drag a vertex when draggable is false", async () => {
    document.body.innerHTML = `
      <mr-draggable>
        <mr-vex-circle-shape
          center='{"x":120,"y":160}'
          radius="12"
          draggable="false">
        </mr-vex-circle-shape>
      </mr-draggable>
    `;

    await flush();

    const draggable = document.querySelector("mr-draggable");
    const vertex = document.querySelector("mr-vex-circle-shape");

    expect(draggable).toBeInstanceOf(MrDraggable);
    expect(vertex).toBeInstanceOf(MrVexCircleShape);

    if (!(draggable instanceof MrDraggable)) {
      throw new Error("Expected mr-draggable instance.");
    }

    if (!(vertex instanceof MrVexCircleShape)) {
      throw new Error("Expected mr-vex-circle-shape instance.");
    }

    const dragController = new DragController(new TestReactiveHost(), () => [draggable]);
    const before = vertex.getCenter();

    expect(vertex.draggable).toBe(false);
    expect(dragController.hitTest({ x: before.x, y: before.y })).toBeNull();

    dragController.onPointerDown({ x: before.x, y: before.y });
    dragController.onPointerMove({ x: before.x + 40, y: before.y + 30 });
    dragController.onPointerUp();

    expect(vertex.getCenter()).toEqual(before);
  });

  it("should drag a vertex when draggable is true", async () => {
    document.body.innerHTML = `
      <mr-draggable>
        <mr-vex-circle-shape
          center='{"x":120,"y":160}'
          radius="12">
        </mr-vex-circle-shape>
      </mr-draggable>
    `;

    await flush();

    const draggable = document.querySelector("mr-draggable");
    const vertex = document.querySelector("mr-vex-circle-shape");

    if (!(draggable instanceof MrDraggable)) {
      throw new Error("Expected mr-draggable instance.");
    }

    if (!(vertex instanceof MrVexCircleShape)) {
      throw new Error("Expected mr-vex-circle-shape instance.");
    }

    const dragController = new DragController(new TestReactiveHost(), () => [draggable]);
    const before = vertex.getCenter();

    expect(dragController.hitTest({ x: before.x, y: before.y })).toBe(vertex);

    dragController.onPointerDown({ x: before.x, y: before.y });
    dragController.onPointerMove({ x: before.x + 25, y: before.y + 15 });
    dragController.onPointerUp();

    expect(vertex.getCenter()).toEqual(new Vector2(before.x + 25, before.y + 15));
  });
});

async function flush(): Promise<void> {
  await customElements.whenDefined("mr-draggable");
  await customElements.whenDefined("mr-vex-circle-shape");
  await Promise.resolve();
  await Promise.resolve();
}
