import { afterEach, describe, expect, it } from "vitest";
import type { ReactiveController, ReactiveControllerHost } from "lit";
import { Vector2 } from "@monorepo/core-math";

import "../../src/index.js";
import { DragController, MrDraggable, MrVexCircleShape, MrVexRect } from "../../src/index.js";

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

describe("MrVexRect", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should derive rectangle geometry from slotted start and end vertices", async () => {
    document.body.innerHTML = `
      <mr-vex-rect stroke="#60a5fa" stroke-width="2">
        <mr-vex-circle-shape slot="start" center='{"x":100,"y":120}' radius="10"></mr-vex-circle-shape>
        <mr-vex-circle-shape slot="end" center='{"x":240,"y":260}' radius="10"></mr-vex-circle-shape>
      </mr-vex-rect>
    `;

    await flush();

    const rect = document.querySelector("mr-vex-rect");

    expect(rect).toBeInstanceOf(MrVexRect);

    if (!(rect instanceof MrVexRect)) {
      throw new Error("Expected mr-vex-rect instance.");
    }

    expect(rect.getPosition()).toEqual(new Vector2(100, 120));
    expect(rect.getWidth()).toBe(140);
    expect(rect.getHeight()).toBe(140);
    expect(rect.containsPoint(new Vector2(180, 180))).toBe(true);
    expect(rect.containsPoint(new Vector2(20, 20))).toBe(false);
  });

  it("should keep non-draggable vertices out of direct drag hit testing", async () => {
    document.body.innerHTML = `
      <mr-draggable>
        <mr-vex-rect stroke="#60a5fa" stroke-width="2">
          <mr-vex-circle-shape slot="start" center='{"x":100,"y":120}' radius="10" draggable="false"></mr-vex-circle-shape>
          <mr-vex-circle-shape slot="end" center='{"x":240,"y":260}' radius="10" draggable="false"></mr-vex-circle-shape>
        </mr-vex-rect>
      </mr-draggable>
    `;

    await flush();

    const draggable = document.querySelector("mr-draggable");
    const rect = document.querySelector("mr-vex-rect");
    const [start, end] = Array.from(
      document.querySelectorAll("mr-vex-circle-shape"),
    );

    expect(draggable).toBeInstanceOf(MrDraggable);
    expect(rect).toBeInstanceOf(MrVexRect);
    expect(start).toBeInstanceOf(MrVexCircleShape);
    expect(end).toBeInstanceOf(MrVexCircleShape);

    if (!(draggable instanceof MrDraggable)) {
      throw new Error("Expected mr-draggable instance.");
    }

    if (!(rect instanceof MrVexRect)) {
      throw new Error("Expected mr-vex-rect instance.");
    }

    if (!(start instanceof MrVexCircleShape) || !(end instanceof MrVexCircleShape)) {
      throw new Error("Expected mr-vex-circle-shape instances.");
    }

    const dragController = new DragController(new TestReactiveHost(), () => [draggable]);
    const startCenter = start.getCenter();

    expect(start.draggable).toBe(false);
    expect(end.draggable).toBe(false);
    expect(start.containsPoint({ x: startCenter.x, y: startCenter.y })).toBe(false);
    expect(dragController.hitTest({ x: startCenter.x, y: startCenter.y })).toBe(draggable);
  });
});

async function flush(): Promise<void> {
  await customElements.whenDefined("mr-vex-rect");
  await customElements.whenDefined("mr-vex-circle-shape");
  await Promise.resolve();
  await Promise.resolve();
}
