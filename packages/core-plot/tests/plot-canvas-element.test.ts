import { describe, expect, it } from "vitest";

import { PlotCanvasElement } from "../src/plot-canvas-element.js";
import { Axis } from "../src/coordinates/axis.js";
import { AxisRange } from "../src/coordinates/axis-range.js";

describe("PlotCanvasElement interaction cancellation", () => {
  it("should cancel an active axis interval drag when a new primary click happens off the axis", () => {
    const element = new PlotCanvasElement() as PlotCanvasElement & {
      mouseController: { pointerState: { canvasX: number; canvasY: number } };
      handlePointerDown: (event: PointerEvent) => void;
      handlePointerMove: () => void;
    };
    const axis = new Axis("x-axis", "horizontal", new AxisRange(-10, 10));
    axis.setLayout({
      startX: 80,
      startY: 200,
      endX: 500,
      endY: 200,
      zeroX: 290,
      zeroY: 200,
      tickValues: [-10, -5, 0, 5, 10],
    });
    element.registerObject(axis);

    element.mouseController.pointerState = {
      canvasX: 220,
      canvasY: 200,
      clientX: 220,
      clientY: 200,
      isInsideCanvas: true,
      primaryButtonDown: true,
      buttons: 1,
      pointerId: 1,
    };
    element.handlePointerDown({ button: 0, pointerId: 1 } as PointerEvent);

    element.mouseController.pointerState = {
      ...element.mouseController.pointerState,
      canvasX: 340,
      clientX: 340,
    };
    element.handlePointerMove();

    expect(axis.getRange().max).toBeGreaterThan(10);

    element.mouseController.pointerState = {
      ...element.mouseController.pointerState,
      canvasX: 32,
      canvasY: 32,
      clientX: 32,
      clientY: 32,
    };
    element.handlePointerDown({ button: 0, pointerId: 2 } as PointerEvent);

    expect(axis.getRange().min).toBe(-10);
    expect(axis.getRange().max).toBe(10);
    expect(element.getSnapshot().dragTargetId).toBeNull();
  });
});
