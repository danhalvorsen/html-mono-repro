// Applications/audio/WebAudio/application-web-audio/tests/Dragging/DragController.spec.ts

import { describe, expect, it } from "vitest";
import { DragControllerFixture } from "./DragControllerFixture";
 
describe("DragController", () => {
  it("should select draggable on pointer down when hit test succeeds", () => {
    const fixture = new DragControllerFixture();
    const draggable = fixture.createDraggable({
      x: 10,
      y: 20,
      hit: true,
    });

    fixture.setCandidates([draggable]);

    fixture.mouse.down(fixture.createPoint(15, 25));

    expect(draggable.containsPointCalls).toEqual([
      { x: 15, y: 25 },
    ]);
  });

  it("should move active draggable by pointer delta", () => {
    const fixture = new DragControllerFixture();
    const draggable = fixture.createDraggable({
      x: 10,
      y: 20,
      hit: true,
    });

    fixture.setCandidates([draggable]);

    fixture.mouse.down(fixture.createPoint(15, 25));
    fixture.mouse.move(fixture.createPoint(25, 40));

    expect(draggable.position).toEqual({
      x: 20,
      y: 35,
    });

    expect(draggable.setPositionCalls).toEqual([
      { x: 20, y: 35 },
    ]);

    expect(fixture.host.requestUpdateCalls).toBe(1);
  });

  it("should not move when pointer move occurs before pointer down", () => {
    const fixture = new DragControllerFixture();
    const draggable = fixture.createDraggable({
      x: 10,
      y: 20,
      hit: true,
    });

    fixture.setCandidates([draggable]);

    fixture.mouse.move(fixture.createPoint(25, 40));

    expect(draggable.position).toEqual({
      x: 10,
      y: 20,
    });

    expect(draggable.setPositionCalls).toEqual([]);
    expect(fixture.host.requestUpdateCalls).toBe(0);
  });

  it("should stop dragging after pointer up", () => {
    const fixture = new DragControllerFixture();
    const draggable = fixture.createDraggable({
      x: 10,
      y: 20,
      hit: true,
    });

    fixture.setCandidates([draggable]);

    fixture.mouse.down(fixture.createPoint(15, 25));
    fixture.mouse.move(fixture.createPoint(20, 30));
    fixture.mouse.up();
    fixture.mouse.move(fixture.createPoint(30, 50));

    expect(draggable.position).toEqual({
      x: 15,
      y: 25,
    });

    expect(draggable.setPositionCalls).toEqual([
      { x: 15, y: 25 },
    ]);

    expect(fixture.host.requestUpdateCalls).toBe(1);
  });

  it("should stop dragging after pointer leave", () => {
    const fixture = new DragControllerFixture();
    const draggable = fixture.createDraggable({
      x: 10,
      y: 20,
      hit: true,
    });

    fixture.setCandidates([draggable]);

    fixture.mouse.down(fixture.createPoint(15, 25));
    fixture.mouse.move(fixture.createPoint(20, 30));
    fixture.mouse.leave();
    fixture.mouse.move(fixture.createPoint(30, 50));

    expect(draggable.position).toEqual({
      x: 15,
      y: 25,
    });

    expect(draggable.setPositionCalls).toEqual([
      { x: 15, y: 25 },
    ]);

    expect(fixture.host.requestUpdateCalls).toBe(1);
  });

  it("should select the last matching draggable", () => {
    const fixture = new DragControllerFixture();

    const first = fixture.createDraggable({
      x: 0,
      y: 0,
      hit: true,
    });

    const second = fixture.createDraggable({
      x: 100,
      y: 100,
      hit: true,
    });

    fixture.setCandidates([first, second]);

    fixture.mouse.down(fixture.createPoint(5, 5));
    fixture.mouse.move(fixture.createPoint(15, 15));

    expect(first.position).toEqual({
      x: 0,
      y: 0,
    });

    expect(second.position).toEqual({
      x: 110,
      y: 110,
    });

    expect(first.setPositionCalls).toEqual([]);
    expect(second.setPositionCalls).toEqual([
      { x: 110, y: 110 },
    ]);
  });

  it("should drag through multiple move steps", () => {
    const fixture = new DragControllerFixture();
    const draggable = fixture.createDraggable({
      x: 10,
      y: 20,
      hit: true,
    });

    fixture.setCandidates([draggable]);

    fixture.mouse.drag(
      fixture.createPoint(15, 25),
      fixture.createPoint(45, 55),
      3,
    );

    expect(draggable.position).toEqual({
      x: 40,
      y: 50,
    });

    expect(draggable.setPositionCalls).toEqual([
      { x: 20, y: 30 },
      { x: 30, y: 40 },
      { x: 40, y: 50 },
    ]);

    expect(fixture.host.requestUpdateCalls).toBe(3);
  });

  it("should do nothing when no draggable is hit", () => {
    const fixture = new DragControllerFixture();
    const draggable = fixture.createDraggable({
      x: 10,
      y: 20,
      hit: false,
    });

    fixture.setCandidates([draggable]);

    fixture.mouse.down(fixture.createPoint(15, 25));
    fixture.mouse.move(fixture.createPoint(30, 40));
    fixture.mouse.up();

    expect(draggable.position).toEqual({
      x: 10,
      y: 20,
    });

    expect(draggable.setPositionCalls).toEqual([]);
    expect(fixture.host.requestUpdateCalls).toBe(0);
  });
});