// Applications/audio/WebAudio/application-web-audio/tests/fixtures/createCircleShapeDragFixture.ts

import type { ReactiveController, ReactiveControllerHost } from "lit";
import { Vector2 } from "@monorepo/core-math";

import { DragController } from "../../src/lit3/Controllers/DragController.js";
import "../../src/lit3/WebComponents/Shapes/Draggable/MrDraggable.js";
import "../../src/lit3/WebComponents/Shapes/CircleShape.js";

import type { MrDraggable } from "../../src/lit3/WebComponents/Shapes/Draggable/MrDraggable.js";
import type { CircleShape } from "../../src/lit3/WebComponents/Shapes/CircleShape.js";

type Point = Readonly<{
  x: number;
  y: number;
}>;

class TestReactiveHost implements ReactiveControllerHost {
  private readonly controllers: ReactiveController[] = [];

  public readonly updateComplete: Promise<boolean> = Promise.resolve(true);
  public requestUpdateCalls = 0;

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
    this.requestUpdateCalls++;
  }

  public connect(): void {
    for (const controller of this.controllers) {
      controller.hostConnected?.();
    }
  }

  public disconnect(): void {
    for (const controller of this.controllers) {
      controller.hostDisconnected?.();
    }
  }
}

export type CircleShapeDragFixture = Readonly<{
  host: TestReactiveHost;
  controller: DragController;
  root: HTMLDivElement;
  draggable: MrDraggable;
  circle: CircleShape;
  pointerDown(point: Point): void;
  pointerMove(point: Point): void;
  pointerUp(): void;
}>;

export async function createCircleShapeDragFixture(
  options?: Readonly<{
    center?: Vector2;
    radius?: number;
  }>,
): Promise<CircleShapeDragFixture> {
  const host = new TestReactiveHost();
  const root = document.createElement("div");
  document.body.append(root);

  const controller = new DragController(host, () => Array.from(root.children));
  host.connect();

  const draggable = document.createElement("mr-draggable") as MrDraggable;
  const circle = document.createElement("mr-circle-shape") as CircleShape;

  circle.center = options?.center ?? new Vector2(80, 90);
  circle.radius = options?.radius ?? 10;

  draggable.append(circle);
  root.append(draggable);

  await draggable.updateComplete;
  await circle.updateComplete;

  return {
    host,
    controller,
    root,
    draggable,
    circle,

    pointerDown(point: Point): void {
      controller.onPointerDown(point);
    },

    pointerMove(point: Point): void {
      controller.onPointerMove(point);
    },

    pointerUp(): void {
      controller.onPointerUp();
    },
  };
}