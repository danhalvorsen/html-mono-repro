// ====================================================================================
// FILE: tests/fixtures/createDragControllerFixture.ts
// ====================================================================================

import type { ReactiveController, ReactiveControllerHost } from "lit";

import { DragController } from "../../src/lit3/Controllers/DragController.js";
import type { IDraggable, Point } from "../../src/lit3/WebComponents/IDraggable.js";
import type { Shape } from "../../src/lit3/WebComponents/Shapes/Shape/Shape.js";

class TestReactiveHost implements ReactiveControllerHost {
  public requestUpdateCalls = 0;
  public readonly updateComplete: Promise<boolean> = Promise.resolve(true);
  public readonly addedControllers: ReactiveController[] = [];

  public addController(controller: ReactiveController): void {
    this.addedControllers.push(controller);
  }

  public removeController(controller: ReactiveController): void {
    const index = this.addedControllers.indexOf(controller);
    if (index >= 0) {
      this.addedControllers.splice(index, 1);
    }
  }

  public requestUpdate(): void {
    this.requestUpdateCalls += 1;
  }
}

class TestDraggable extends HTMLElement implements IDraggable {
  public readonly shape = {} as Shape;
  public position: Point;
  public hit = false;

  public readonly setPositionCalls: Point[] = [];
  public readonly containsPointCalls: Point[] = [];

  public constructor(position: Point = { x: 0, y: 0 }) {
    super();
    this.position = position;
  }

  public getPosition(): Point {
    return this.position;
  }

  public setPosition(position: Point): void {
    this.position = position;
    this.setPositionCalls.push(position);
  }

  public containsPoint(point: Point): boolean {
    this.containsPointCalls.push(point);
    return this.hit;
  }
}

if (!customElements.get("test-draggable")) {
  customElements.define("test-draggable", TestDraggable);
}

export type DragControllerFixture = {
  host: TestReactiveHost;
  controller: DragController;
  setCandidates: (candidates: Element[]) => void;
  createDraggable: (options?: Partial<{ x: number; y: number; hit: boolean }>) => TestDraggable;
  createPoint: (x: number, y: number) => Point;
};

export function createDragControllerFixture(): DragControllerFixture {
  const host = new TestReactiveHost();
  const candidates: Element[] = [];
  const controller = new DragController(host, () => candidates);

  return {
    host,
    controller,
    setCandidates: (nextCandidates) => {
      candidates.splice(0, candidates.length, ...nextCandidates);
    },
    createDraggable: (options) => {
      const draggable = document.createElement("test-draggable") as TestDraggable;
      draggable.position = {
        x: options?.x ?? 0,
        y: options?.y ?? 0,
      };
      draggable.hit = options?.hit ?? false;
      return draggable;
    },
    createPoint: (x, y) => ({ x, y }),
  };
}