import { describe, expect, test as base } from "vitest";
import type { IReactiveController } from "@monorepo/core-reactive-abstract";
import { GridToggleController, GRID_TOGGLE_EVENT } from "../src/controllers/canvas/GridToggleController.js";
import { DragController } from "../src/controllers/drag/DragController.js";
import { MouseController } from "../src/controllers/mouse/MouseController.js";
import { ScaleController } from "../src/controllers/shape/ScaleController.js";
import { EventReactiveHost } from "../src/host/EventReactiveHost.js";
import { ReactiveHost } from "../src/host/ReactiveHost.js";
import { CanvasViewRuntime } from "../src/runtime/CanvasViewRuntime.js";
import type { SvgCanvas } from "../src/canvas/svgCanvas.js";
import type { SvgGrid } from "../src/canvas/svgGrid.js";
import type { MouseDragMove, RectModel } from "../src/controllers/drag/Types.js";

interface ControllerLifecycleLog {
  readonly connectedHosts: ReadonlyArray<unknown>;
  readonly disconnectedCount: number;
  readonly updateCount: number;
}

interface TestFixture {
  createReactiveHost(): ReactiveHost;
  createEventReactiveHost(): EventReactiveHost;
  createMouseController(): MouseController;
  createRect(overrides?: Partial<RectModel>): RectModel;
  createMove(overrides?: Partial<MouseDragMove>): MouseDragMove;
  createCanvas(): CanvasFake;
  createRenderer(): RendererFake;
  createLifecycleController(): LifecycleControllerSpy;
}

class LifecycleControllerSpy implements IReactiveController<ReactiveHost> {
  private readonly _connectedHosts: unknown[] = [];
  private _disconnectedCount = 0;
  private _updateCount = 0;

  public get log(): ControllerLifecycleLog {
    return {
      connectedHosts: [...this._connectedHosts],
      disconnectedCount: this._disconnectedCount,
      updateCount: this._updateCount,
    };
  }

  public hostConnected(host: ReactiveHost): void {
    this._connectedHosts.push(host);
  }

  public hostDisconnected(): void {
    this._disconnectedCount += 1;
  }

  public hostUpdate(): void {
    this._updateCount += 1;
  }
}

class GridFake implements SvgGrid {
  public readonly enabledCalls: boolean[] = [];

  public setEnabled(enabled: boolean): void {
    this.enabledCalls.push(enabled);
  }
}

class CanvasFake implements SvgCanvas {
  public readonly grid: GridFake;

  public constructor(grid?: GridFake) {
    this.grid = grid ?? new GridFake();
  }
}

class RendererFake {
  public renderCount = 0;

  public render(): void {
    this.renderCount += 1;
  }
}

class TestFixtureImpl implements TestFixture {
  public createReactiveHost(): ReactiveHost {
    return new ReactiveHost();
  }

  public createEventReactiveHost(): EventReactiveHost {
    return new EventReactiveHost();
  }

  public createMouseController(): MouseController {
    return new MouseController();
  }

  public createRect(overrides?: Partial<RectModel>): RectModel {
    return {
      x: overrides?.x ?? 10,
      y: overrides?.y ?? 20,
      w: overrides?.w ?? 100,
      h: overrides?.h ?? 80,
    };
  }

  public createMove(overrides?: Partial<MouseDragMove>): MouseDragMove {
    return {
      dx: overrides?.dx ?? 0,
      dy: overrides?.dy ?? 0,
      current: overrides?.current ?? { x: 0, y: 0 },
    };
  }

  public createCanvas(): CanvasFake {
    return new CanvasFake();
  }

  public createRenderer(): RendererFake {
    return new RendererFake();
  }

  public createLifecycleController(): LifecycleControllerSpy {
    return new LifecycleControllerSpy();
  }
}

const test = base.extend<{ fixture: TestFixture }>({
  fixture: async ({}, use) => {
    await use(new TestFixtureImpl());
  },
});

describe("ReactiveHost", () => {
  test("should connect update and disconnect controllers through the core", ({ fixture }) => {
    const host = fixture.createReactiveHost();
    const controller = fixture.createLifecycleController();

    host.addController(controller);

    expect(host.controllerCount).toBe(1);
    expect(host.isDirty).toBe(true);
    expect(controller.log.connectedHosts).toEqual([host]);

    const firstUpdate = host.updateIfNeeded();
    const secondUpdate = host.updateIfNeeded();

    expect(firstUpdate).toBe(true);
    expect(secondUpdate).toBe(false);
    expect(controller.log.updateCount).toBe(1);

    host.removeController(controller);

    expect(host.controllerCount).toBe(0);
    expect(host.isDirty).toBe(true);
    expect(controller.log.disconnectedCount).toBe(1);
  });

  test("markDirty should request a new update cycle", ({ fixture }) => {
    const host = fixture.createReactiveHost();

    expect(host.updateIfNeeded()).toBe(true);
    expect(host.updateIfNeeded()).toBe(false);

    host.markDirty();

    expect(host.isDirty).toBe(true);
    expect(host.updateIfNeeded()).toBe(true);
  });
});

describe("EventReactiveHost and GridToggleController", () => {
  test("should apply grid toggle events to the canvas and request update", ({ fixture }) => {
    const host = fixture.createEventReactiveHost();
    const canvas = fixture.createCanvas();

    const controller = new GridToggleController(host, () => canvas);

    expect(host.controllerCount).toBe(1);

    host.updateIfNeeded();
    expect(host.isDirty).toBe(false);

    host.dispatchEvent(
      new CustomEvent(GRID_TOGGLE_EVENT, {
        detail: { enabled: false },
      }),
    );

    expect(canvas.grid.enabledCalls).toEqual([false]);
    expect(host.isDirty).toBe(true);

    host.removeController(controller);

    host.updateIfNeeded();
    host.dispatchEvent(
      new CustomEvent(GRID_TOGGLE_EVENT, {
        detail: { enabled: true },
      }),
    );

    expect(canvas.grid.enabledCalls).toEqual([false]);
  });

  test("should buffer latest state and apply it later when a canvas becomes available", ({ fixture }) => {
    const host = fixture.createEventReactiveHost();
    let canvas: CanvasFake | undefined;

    const controller = new GridToggleController(host, () => canvas);

    host.dispatchEvent(
      new CustomEvent(GRID_TOGGLE_EVENT, {
        detail: { enabled: false },
      }),
    );

    canvas = fixture.createCanvas();
    controller.applyBufferedState();

    expect(canvas.grid.enabledCalls).toEqual([false]);
  });

  test("should default buffered state to enabled when no event has been received", ({ fixture }) => {
    const host = fixture.createEventReactiveHost();
    const canvas = fixture.createCanvas();
    const controller = new GridToggleController(host, () => canvas);

    controller.applyBufferedState();

    expect(canvas.grid.enabledCalls).toEqual([true]);
  });

  test("should ignore malformed toggle events", ({ fixture }) => {
    const host = fixture.createEventReactiveHost();
    const canvas = fixture.createCanvas();

    new GridToggleController(host, () => canvas);

    host.dispatchEvent(
      new CustomEvent(GRID_TOGGLE_EVENT, {
        detail: { enabled: "bad-value" as unknown as boolean },
      }),
    );

    expect(canvas.grid.enabledCalls).toEqual([]);
  });
});

describe("MouseController", () => {
  test("should publish start move and end events to subscribers", ({ fixture }) => {
    const mouse = fixture.createMouseController();
    const events: string[] = [];

    mouse.onStart(() => events.push("start"));
    mouse.onMove((move) => events.push(`move:${move.dx}:${move.dy}`));
    mouse.onEnd(() => events.push("end"));

    mouse.emitStart();
    mouse.emitMove(fixture.createMove({ dx: 4, dy: 6 }));
    mouse.emitEnd();

    expect(events).toEqual(["start", "move:4:6", "end"]);
  });

  test("should support unsubscribe and dispose", ({ fixture }) => {
    const mouse = fixture.createMouseController();
    const events: string[] = [];

    const unsubscribeStart = mouse.onStart(() => events.push("start"));
    const unsubscribeMove = mouse.onMove(() => events.push("move"));
    const unsubscribeEnd = mouse.onEnd(() => events.push("end"));

    unsubscribeStart();
    unsubscribeMove();
    unsubscribeEnd();

    mouse.emitStart();
    mouse.emitMove(fixture.createMove());
    mouse.emitEnd();

    expect(events).toEqual([]);

    mouse.onStart(() => events.push("after-dispose-start"));
    mouse.dispose();
    mouse.emitStart();

    expect(events).toEqual([]);
  });
});

describe("DragController", () => {
  test("should move the rectangle while dragging", ({ fixture }) => {
    const host = fixture.createReactiveHost();
    const mouse = fixture.createMouseController();
    const rect = fixture.createRect();

    new DragController(host, mouse, rect);

    host.updateIfNeeded();
    expect(host.isDirty).toBe(false);

    const sut = new DragController(host, mouse, rect);
    host.removeController(sut);

    const controller = new DragController(host, mouse, rect);
    controller.beginDrag();

    mouse.emitStart();
    mouse.emitMove(fixture.createMove({ dx: 15, dy: -5 }));
    mouse.emitEnd();

    expect(rect).toEqual({
      x: 25,
      y: 15,
      w: 100,
      h: 80,
    });
    expect(host.isDirty).toBe(true);
  });

  test("should ignore movement before beginDrag", ({ fixture }) => {
    const host = fixture.createReactiveHost();
    const mouse = fixture.createMouseController();
    const rect = fixture.createRect();

    new DragController(host, mouse, rect);

    host.updateIfNeeded();
    mouse.emitStart();
    mouse.emitMove(fixture.createMove({ dx: 10, dy: 10 }));
    mouse.emitEnd();

    expect(rect).toEqual({
      x: 10,
      y: 20,
      w: 100,
      h: 80,
    });
  });

  test("should stop reacting after host disconnection", ({ fixture }) => {
    const host = fixture.createReactiveHost();
    const mouse = fixture.createMouseController();
    const rect = fixture.createRect();

    const controller = new DragController(host, mouse, rect);
    controller.beginDrag();

    host.removeController(controller);

    mouse.emitStart();
    mouse.emitMove(fixture.createMove({ dx: 30, dy: 40 }));
    mouse.emitEnd();

    expect(rect).toEqual({
      x: 10,
      y: 20,
      w: 100,
      h: 80,
    });
  });
});

describe("ScaleController", () => {
  test("should scale from south east handle", ({ fixture }) => {
    const host = fixture.createReactiveHost();
    const mouse = fixture.createMouseController();
    const rect = fixture.createRect();

    const controller = new ScaleController(host, mouse, rect);
    controller.beginScale("se");

    host.updateIfNeeded();
    mouse.emitStart();
    mouse.emitMove(fixture.createMove({ dx: 25, dy: 10 }));
    mouse.emitEnd();

    expect(rect).toEqual({
      x: 10,
      y: 20,
      w: 125,
      h: 90,
    });
    expect(host.isDirty).toBe(true);
  });

  test("should scale from north west handle and preserve opposite corner", ({ fixture }) => {
    const host = fixture.createReactiveHost();
    const mouse = fixture.createMouseController();
    const rect = fixture.createRect();

    const controller = new ScaleController(host, mouse, rect);
    controller.beginScale("nw");

    mouse.emitStart();
    mouse.emitMove(fixture.createMove({ dx: 10, dy: 5 }));
    mouse.emitEnd();

    expect(rect).toEqual({
      x: 20,
      y: 25,
      w: 90,
      h: 75,
    });
  });

  test("should clamp to min size when scaling smaller than allowed", ({ fixture }) => {
    const host = fixture.createReactiveHost();
    const mouse = fixture.createMouseController();
    const rect = fixture.createRect();

    const controller = new ScaleController(host, mouse, rect, 40);
    controller.beginScale("nw");

    mouse.emitStart();
    mouse.emitMove(fixture.createMove({ dx: 90, dy: 70 }));
    mouse.emitEnd();

    expect(rect).toEqual({
      x: 70,
      y: 60,
      w: 40,
      h: 40,
    });
  });

  test("should stop reacting after host disconnection", ({ fixture }) => {
    const host = fixture.createReactiveHost();
    const mouse = fixture.createMouseController();
    const rect = fixture.createRect();

    const controller = new ScaleController(host, mouse, rect);
    controller.beginScale("se");
    host.removeController(controller);

    mouse.emitStart();
    mouse.emitMove(fixture.createMove({ dx: 50, dy: 50 }));
    mouse.emitEnd();

    expect(rect).toEqual({
      x: 10,
      y: 20,
      w: 100,
      h: 80,
    });
  });
});

describe("CanvasViewRuntime", () => {
  test("should render when at least one shape updates", ({ fixture }) => {
    const renderer = fixture.createRenderer();
    const runtime = new CanvasViewRuntime(renderer);

    const shapeA = new ReactiveHost();
    const shapeB = new ReactiveHost();

    runtime.add(shapeA as never);
    runtime.add(shapeB as never);

    runtime.tick();

    expect(renderer.renderCount).toBe(1);

    runtime.tick();

    expect(renderer.renderCount).toBe(1);
  });

  test("should not render when no shapes are dirty", ({ fixture }) => {
    const renderer = fixture.createRenderer();
    const runtime = new CanvasViewRuntime(renderer);
    const shape = new ReactiveHost();

    runtime.add(shape as never);
    runtime.tick();
    shape.updateIfNeeded();

    runtime.tick();

    expect(renderer.renderCount).toBe(1);
  });

  test("should stop tracking removed shapes", ({ fixture }) => {
    const renderer = fixture.createRenderer();
    const runtime = new CanvasViewRuntime(renderer);
    const shape = new ReactiveHost();

    runtime.add(shape as never);
    runtime.remove(shape as never);

    runtime.tick();

    expect(renderer.renderCount).toBe(0);
  });

  test("should render again after a tracked shape becomes dirty later", ({ fixture }) => {
    const renderer = fixture.createRenderer();
    const runtime = new CanvasViewRuntime(renderer);
    const shape = new ReactiveHost();

    runtime.add(shape as never);

    runtime.tick();
    expect(renderer.renderCount).toBe(1);

    shape.markDirty();
    runtime.tick();

    expect(renderer.renderCount).toBe(2);
  });
});