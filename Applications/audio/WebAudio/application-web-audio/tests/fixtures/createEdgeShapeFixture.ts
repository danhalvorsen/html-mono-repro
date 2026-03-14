// Applications/audio/WebAudio/application-web-audio/tests/fixtures/createEdgeShapeDragFixture.ts

import type { ReactiveController, ReactiveControllerHost } from "lit";
import { Vector2 } from "@monorepo/core-math";

import { DragController } from "../../src/lit3/Controllers/DragController.js";
import "../../src/lit3/WebComponents/Shapes/Draggable/MrDraggable.js";
import "../../src/lit3/WebComponents/Shapes/EdgeShape.js";

import type { MrDraggable } from "../../src/lit3/WebComponents/Shapes/Draggable/MrDraggable.js";
import type { EdgeShape } from "../../src/lit3/WebComponents/Shapes/EdgeShape.js";

type Point = Readonly<{
  x: number;
  y: number;
}>;

type DebugLogger = (message: string, data?: unknown) => void;

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

export type EdgeShapeDragFixture = Readonly<{
  host: TestReactiveHost;
  controller: DragController;
  root: HTMLDivElement;
  draggable: MrDraggable;
  edge: EdgeShape;
  pointerDown(point: Point): void;
  pointerMove(point: Point): void;
  pointerUp(): void;
  getLength(): number;
  snapshot(): Readonly<{
    p0: Vector2;
    p1: Vector2;
    position: Vector2;
    width: number;
    height: number;
    requestUpdateCalls: number;
  }>;
}>;

export async function createEdgeShapeDragFixture(
  options?: Readonly<{
    p0?: Vector2;
    p1?: Vector2;
    debug?: boolean;
    logger?: DebugLogger;
  }>,
): Promise<EdgeShapeDragFixture> {
  const host = new TestReactiveHost();
  const root = document.createElement("div");
  document.body.append(root);

  const logger = options?.logger ?? defaultLogger;
  const debugEnabled = options?.debug ?? false;

  const debug = (message: string, data?: unknown): void => {
    if (!debugEnabled) {
      return;
    }

    logger(`[EdgeShapeDragFixture] ${message}`, data);
  };

  const controller = new DragController(host, () => Array.from(root.children));
  host.connect();

  const draggable = document.createElement("mr-draggable") as MrDraggable;
  const edge = document.createElement("mr-edge-shape") as EdgeShape;

  edge.p0 = options?.p0 ?? new Vector2(80, 80);
  edge.p1 = options?.p1 ?? new Vector2(220, 160);

  draggable.append(edge);
  root.append(draggable);

  await draggable.updateComplete;
  await edge.updateComplete;

  debug("fixture created", snapshot());

  function pointerDown(point: Point): void {
    debug("pointerDown before", {
      point,
      snapshot: snapshot(),
    });

    controller.onPointerDown(point);

    debug("pointerDown after", {
      point,
      snapshot: snapshot(),
    });
  }

  function pointerMove(point: Point): void {
    debug("pointerMove before", {
      point,
      snapshot: snapshot(),
    });

    controller.onPointerMove(point);

    debug("pointerMove after", {
      point,
      snapshot: snapshot(),
    });
  }

  function pointerUp(): void {
    debug("pointerUp before", snapshot());

    controller.onPointerUp();

    debug("pointerUp after", snapshot());
  }

  function getLength(): number {
    return Math.hypot(edge.p1.x - edge.p0.x, edge.p1.y - edge.p0.y);
  }

  function snapshot(): Readonly<{
    p0: Vector2;
    p1: Vector2;
    position: Vector2;
    width: number;
    height: number;
    requestUpdateCalls: number;
  }> {
    return {
      p0: new Vector2(edge.p0.x, edge.p0.y),
      p1: new Vector2(edge.p1.x, edge.p1.y),
      position: edge.getPosition(),
      width: edge.getWidth(),
      height: edge.getHeight(),
      requestUpdateCalls: host.requestUpdateCalls,
    };
  }

  return {
    host,
    controller,
    root,
    draggable,
    edge,
    pointerDown,
    pointerMove,
    pointerUp,
    getLength,
    snapshot,
  };
}

function defaultLogger(message: string, data?: unknown): void {
  if (data === undefined) {
    console.debug(message);
    return;
  }

  console.debug(message, data);
}