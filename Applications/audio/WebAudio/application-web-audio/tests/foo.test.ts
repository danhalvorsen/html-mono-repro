// Fix 6: tests/foo.test.ts
// Update to the class-based fixture API.

import { beforeEach, describe, expect, it } from "vitest";
import { DragControllerFixture } from "./DragController/DragControllerFixture.js";
describe("DragController", () => {
  let fixture: DragControllerFixture;

  beforeEach(() => {
    fixture = new DragControllerFixture();
  });

  it("should register itself on the reactive host", () => {
    expect(fixture.host.hasController(fixture.controller)).toBe(true);
  });

  it("should activate the last matching draggable on mouse down", () => {
    const first = fixture.createDraggable({ hit: true });
    const second = fixture.createDraggable({ hit: true });

    fixture.setCandidates([
      first as unknown as Element,
      second as unknown as Element,
    ]);

    fixture.controller.onPointerDown(fixture.createPoint(10, 20));
    fixture.controller.onPointerMove(fixture.createPoint(16, 29));

    expect(first.setPositionCalls).toHaveLength(0);
    expect(second.setPositionCalls).toEqual([{ x: 6, y: 9 }]);
    expect(fixture.host.requestUpdateCalls).toBe(1);
  });

  it("should move the active draggable by mouse delta", () => {
    const draggable = fixture.createDraggable({ x: 100, y: 200, hit: true });

    fixture.setCandidates([draggable as unknown as Element]);

    fixture.controller.onPointerDown(fixture.createPoint(50, 60));
    fixture.controller.onPointerMove(fixture.createPoint(55, 68));

    expect(draggable.position).toEqual({ x: 105, y: 208 });
    expect(draggable.setPositionCalls).toEqual([{ x: 105, y: 208 }]);
    expect(fixture.host.requestUpdateCalls).toBe(1);
  });

  it("should continue dragging using the latest mouse position as origin", () => {
    const draggable = fixture.createDraggable({ x: 10, y: 20, hit: true });

    fixture.setCandidates([draggable as unknown as Element]);

    fixture.controller.onPointerDown(fixture.createPoint(100, 100));
    fixture.controller.onPointerMove(fixture.createPoint(103, 104));
    fixture.controller.onPointerMove(fixture.createPoint(113, 124));

    expect(draggable.setPositionCalls).toEqual([
      { x: 13, y: 24 },
      { x: 23, y: 44 },
    ]);
    expect(fixture.host.requestUpdateCalls).toBe(2);
  });

  it("should not request update when mouse move delta is zero", () => {
    const draggable = fixture.createDraggable({ x: 10, y: 20, hit: true });

    fixture.setCandidates([draggable as unknown as Element]);

    fixture.controller.onPointerDown(fixture.createPoint(7, 8));
    fixture.controller.onPointerMove(fixture.createPoint(7, 8));

    expect(draggable.setPositionCalls).toHaveLength(0);
    expect(fixture.host.requestUpdateCalls).toBe(0);
  });

  it("should do nothing on mouse move when no draggable is active", () => {
    const draggable = fixture.createDraggable({ x: 10, y: 20, hit: false });

    fixture.setCandidates([draggable as unknown as Element]);

    fixture.controller.onPointerDown(fixture.createPoint(0, 0));
    fixture.controller.onPointerMove(fixture.createPoint(5, 5));

    expect(draggable.setPositionCalls).toHaveLength(0);
    expect(fixture.host.requestUpdateCalls).toBe(0);
  });

  it("should clear the active draggable on mouse up", () => {
    const draggable = fixture.createDraggable({ x: 10, y: 10, hit: true });

    fixture.setCandidates([draggable as unknown as Element]);

    fixture.controller.onPointerDown(fixture.createPoint(1, 1));
    fixture.controller.onPointerUp();
    fixture.controller.onPointerMove(fixture.createPoint(4, 5));

    expect(draggable.setPositionCalls).toHaveLength(0);
    expect(fixture.host.requestUpdateCalls).toBe(0);
  });

  it("should clear drag state on host disconnected", () => {
    const draggable = fixture.createDraggable({ x: 10, y: 10, hit: true });

    fixture.setCandidates([draggable as unknown as Element]);

    fixture.controller.onPointerDown(fixture.createPoint(1, 1));
    fixture.controller.hostDisconnected();
    fixture.controller.onPointerMove(fixture.createPoint(4, 5));

    expect(draggable.setPositionCalls).toHaveLength(0);
    expect(fixture.host.requestUpdateCalls).toBe(0);
  });
});