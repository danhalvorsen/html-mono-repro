// tests/fixtures/createDragControllerFixture.ts

import type { ReactiveController, ReactiveControllerHost } from "lit";
import { beforeEach } from "vitest";

import { DragController } from "../../src/index.js";
import type { IDraggable, IVisualShape, Point } from "../../src/index.js";

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

class TestDraggable implements IDraggable {
  public readonly shape = {} as IVisualShape;
  public position: Point;
  public hit = false;

  public readonly setPositionCalls: Point[] = [];
  public readonly containsPointCalls: Point[] = [];

  public constructor(position: Point = { x: 0, y: 0 }) {
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

export type DragControllerFixture = {
  host: TestReactiveHost;
  controller: DragController;
  setCandidates: (candidates: IDraggable[]) => void;
  createDraggable: (options?: Partial<{ x: number; y: number; hit: boolean }>) => TestDraggable;
  createPoint: (x: number, y: number) => Point;
};

export function createDragControllerFixture(): DragControllerFixture {
  const fixture = {} as DragControllerFixture;

  beforeEach(() => {
    const host = new TestReactiveHost();
    const candidates: IDraggable[] = [];
    const controller = new DragController(
      host,
      () => candidates as unknown as Element[],
    );

    fixture.host = host;
    fixture.controller = controller;
    fixture.setCandidates = (nextCandidates) => {
      candidates.splice(0, candidates.length, ...nextCandidates);
    };
    fixture.createDraggable = (options) => {
      const draggable = new TestDraggable({
        x: options?.x ?? 0,
        y: options?.y ?? 0,
      });
      draggable.hit = options?.hit ?? false;
      return draggable;
    };
    fixture.createPoint = (x, y) => ({ x, y });
  });

  return fixture;
}