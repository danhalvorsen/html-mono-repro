import { describe, expect, it } from "vitest";

import { DragController } from "../src/controllers/drag-controller.js";
import { CanvasObject, type CanvasObjectDragContext } from "../src/core/canvas-object.js";
import { CorePlotFixture } from "./fixtures/core-plot.fixture.js";

class MovableCanvasObject extends CanvasObject {
  public dragStartCount = 0;
  public dragMoveCount = 0;
  public dragEndCount = 0;
  public lastDeltaX = 0;
  public lastDeltaY = 0;

  public constructor(id: string) {
    super(id);
  }

  public override render() {
    throw new Error("not used");
  }

  public override hitTest(): boolean {
    return true;
  }

  public override onDragStart(_context: CanvasObjectDragContext): void {
    this.dragStartCount += 1;
  }

  public override onDragMove(context: CanvasObjectDragContext): void {
    this.dragMoveCount += 1;
    this.lastDeltaX = context.deltaX;
    this.lastDeltaY = context.deltaY;
  }

  public override onDragEnd(_context: CanvasObjectDragContext): void {
    this.dragEndCount += 1;
  }

  public override onDragCancel(_context: CanvasObjectDragContext): void {
    this.dragEndCount += 100;
  }
}

describe("DragController", () => {
  const fixture = new CorePlotFixture();

  it("should publish drag lifecycle callbacks to draggable canvas objects", () => {
    const host = fixture.createReactiveHost() as never;
    const mouseController = {
      pointer: {
        canvasX: 10,
        canvasY: 20,
      },
    };
    const controller = new DragController(host, mouseController as never);
    const target = new MovableCanvasObject("movable");

    controller.startDrag(target);
    mouseController.pointer.canvasX = 20;
    mouseController.pointer.canvasY = 26;
    controller.updateDrag();
    controller.endDrag();

    expect(target.dragStartCount).toBe(1);
    expect(target.dragMoveCount).toBe(1);
    expect(target.dragEndCount).toBe(1);
    expect(target.lastDeltaX).toBe(10);
    expect(target.lastDeltaY).toBe(6);
  });

  it("should stop a pending drag without starting a drag operation below the threshold", () => {
    const host = fixture.createReactiveHost() as never;
    const mouseController = {
      pointer: {
        canvasX: 10,
        canvasY: 20,
      },
    };
    const controller = new DragController(host, mouseController as never);
    const target = new MovableCanvasObject("movable");

    controller.startDrag(target);
    mouseController.pointer.canvasX = 13;
    mouseController.pointer.canvasY = 22;
    controller.updateDrag();
    controller.endDrag();

    expect(target.dragStartCount).toBe(0);
    expect(target.dragMoveCount).toBe(0);
    expect(target.dragEndCount).toBe(0);
    expect(controller.state.phase).toBe("idle");
  });

  it("should expose pending phase before the drag threshold is crossed", () => {
    const host = fixture.createReactiveHost() as never;
    const mouseController = {
      pointer: {
        canvasX: 10,
        canvasY: 20,
      },
    };
    const controller = new DragController(host, mouseController as never);
    const target = new MovableCanvasObject("movable");

    controller.startDrag(target);
    mouseController.pointer.canvasX = 14;
    mouseController.pointer.canvasY = 22;
    controller.updateDrag();

    expect(controller.state.phase).toBe("pending");
    expect(controller.state.isActive).toBe(false);
  });

  it("should cancel an active drag without completing it", () => {
    const host = fixture.createReactiveHost() as never;
    const mouseController = {
      pointer: {
        canvasX: 10,
        canvasY: 20,
      },
    };
    const controller = new DragController(host, mouseController as never);
    const target = new MovableCanvasObject("movable");

    controller.startDrag(target);
    mouseController.pointer.canvasX = 20;
    mouseController.pointer.canvasY = 30;
    controller.updateDrag();
    controller.cancelDrag();

    expect(target.dragStartCount).toBe(1);
    expect(target.dragMoveCount).toBe(1);
    expect(target.dragEndCount).toBe(100);
    expect(controller.state.phase).toBe("idle");
  });
});
