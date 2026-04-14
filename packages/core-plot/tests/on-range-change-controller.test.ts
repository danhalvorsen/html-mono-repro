import { describe, expect, it } from "vitest";

import { DragController } from "../src/controllers/drag-controller.js";
import { OnRangeChangeController } from "../src/controllers/on-range-change-controller.js";
import { Axis } from "../src/coordinates/axis.js";
import { AxisRange } from "../src/coordinates/axis-range.js";
import { CorePlotFixture } from "./fixtures/core-plot.fixture.js";

describe("OnRangeChangeController", () => {
  const fixture = new CorePlotFixture();

  it("should expand the axis interval when the drag moves right", () => {
    const host = fixture.createReactiveHost() as never;
    const mouseController = {
      pointer: {
        canvasX: 120,
        canvasY: 100,
      },
    };
    const dragController = new DragController(host, mouseController as never);
    const controller = new OnRangeChangeController(host, dragController);
    const axis = new Axis("x-axis", "horizontal", new AxisRange(-10, 10));

    dragController.startDrag(axis);
    mouseController.pointer.canvasX = 240;
    dragController.updateDrag();
    controller.applyActiveRangeChange();

    expect(axis.getRange().min).toBeLessThan(-10);
    expect(axis.getRange().max).toBeGreaterThan(10);
  });

  it("should contract the axis interval when the drag moves left", () => {
    const host = fixture.createReactiveHost() as never;
    const mouseController = {
      pointer: {
        canvasX: 240,
        canvasY: 100,
      },
    };
    const dragController = new DragController(host, mouseController as never);
    const controller = new OnRangeChangeController(host, dragController);
    const axis = new Axis("x-axis", "horizontal", new AxisRange(-10, 10));

    dragController.startDrag(axis);
    mouseController.pointer.canvasX = 144;
    dragController.updateDrag();
    controller.applyActiveRangeChange();

    expect(axis.getRange().min).toBeGreaterThan(-10);
    expect(axis.getRange().max).toBeLessThan(10);
  });

  it("should restore the start interval when the range change is cancelled", () => {
    const host = fixture.createReactiveHost() as never;
    const mouseController = {
      pointer: {
        canvasX: 120,
        canvasY: 100,
      },
    };
    const dragController = new DragController(host, mouseController as never);
    const controller = new OnRangeChangeController(host, dragController);
    const axis = new Axis("x-axis", "horizontal", new AxisRange(-10, 10));

    dragController.startDrag(axis);
    mouseController.pointer.canvasX = 240;
    dragController.updateDrag();
    controller.applyActiveRangeChange();
    controller.cancelRangeChange();

    expect(axis.getRange().min).toBe(-10);
    expect(axis.getRange().max).toBe(10);
  });
});
