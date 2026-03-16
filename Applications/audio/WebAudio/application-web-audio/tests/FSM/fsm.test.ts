
import { describe, expect, it } from "vitest";
import { DragStateMachine } from "../../src/index.js";
import { DragStateMachineFixture } from '../Fixtures/DragFsmFixture.js'

describe("DragStateMachine", () => {
  const fixture = DragStateMachineFixture.create();

  it("should start in idle state", () => {
    expect(fixture.machine.getState()).toBe(DragStateMachine.States.Idle);
    expect(fixture.machine.getSession().isDraggingEnabled()).toBe(true);
    expect(fixture.machine.getSession().getPointerId()).toBeNull();
    expect(fixture.machine.getSession().getTargetId()).toBeNull();
  });

  it("should arm on pointer down", async () => {
    const result = await fixture.arm(7, 100, 200, "node-1");

    expect(result.wasTransitionTaken()).toBe(true);
    expect(result.getFrom()).toBe(DragStateMachine.States.Idle);
    expect(result.getTo()).toBe(DragStateMachine.States.Armed);
    expect(result.getOutput()?.name).toBe("drag.armed");

    const session = result.getSession();
    expect(session.getPointerId()).toBe(7);
    expect(session.getTargetId()).toBe("node-1");
    expect(session.getStartX()).toBe(100);
    expect(session.getStartY()).toBe(200);
    expect(session.getCurrentX()).toBe(100);
    expect(session.getCurrentY()).toBe(200);
  });

  it("should not arm when disabled", async () => {
    fixture.useDisabledMachine();

    const result = await fixture.arm(7, 100, 200, "node-1");

    expect(result.wasTransitionTaken()).toBe(false);
    expect(result.getFrom()).toBe(DragStateMachine.States.Idle);
    expect(result.getTo()).toBe(DragStateMachine.States.Idle);
    expect(result.getOutput()).toBeNull();
  });

  it("should start dragging on matching pointer move", async () => {
    const result = await fixture.startDragging(1, 10, 20, 30, 40, "shape-1");

    expect(result.wasTransitionTaken()).toBe(true);
    expect(result.getFrom()).toBe(DragStateMachine.States.Armed);
    expect(result.getTo()).toBe(DragStateMachine.States.Dragging);
    expect(result.getOutput()?.name).toBe("drag.started");

    const session = result.getSession();
    expect(session.getPointerId()).toBe(1);
    expect(session.getTargetId()).toBe("shape-1");
    expect(session.getStartX()).toBe(10);
    expect(session.getStartY()).toBe(20);
    expect(session.getCurrentX()).toBe(30);
    expect(session.getCurrentY()).toBe(40);
  });

  it("should ignore pointer move from wrong pointer while armed", async () => {
    await fixture.arm(1, 10, 20, "shape-1");

    const result = await fixture.pointerMove(2, 30, 40, "shape-1");

    expect(result.wasTransitionTaken()).toBe(false);
    expect(result.getFrom()).toBe(DragStateMachine.States.Armed);
    expect(result.getTo()).toBe(DragStateMachine.States.Armed);
    expect(result.getOutput()).toBeNull();
  });

  it("should emit moved output while dragging", async () => {
    await fixture.startDragging(1, 10, 20, 30, 40, "shape-1");

    const result = await fixture.pointerMove(1, 50, 60, "shape-1");

    expect(result.wasTransitionTaken()).toBe(true);
    expect(result.getFrom()).toBe(DragStateMachine.States.Dragging);
    expect(result.getTo()).toBe(DragStateMachine.States.Dragging);
    expect(result.getOutput()?.name).toBe("drag.moved");
  });

  it("should drop from dragging", async () => {
    const result = await fixture.dropFromDragging(
      1,
      10,
      20,
      30,
      40,
      50,
      60,
      "shape-1",
    );

    expect(result.wasTransitionTaken()).toBe(true);
    expect(result.getFrom()).toBe(DragStateMachine.States.Dragging);
    expect(result.getTo()).toBe(DragStateMachine.States.Dropped);
    expect(result.getOutput()?.name).toBe("drag.dropped");
  });

  it("should cancel from dragging", async () => {
    const result = await fixture.cancelFromDragging(
      1,
      10,
      20,
      30,
      40,
      "shape-1",
    );

    expect(result.wasTransitionTaken()).toBe(true);
    expect(result.getFrom()).toBe(DragStateMachine.States.Dragging);
    expect(result.getTo()).toBe(DragStateMachine.States.Cancelled);
    expect(result.getOutput()?.name).toBe("drag.cancelled");
  });

  it("should reset from dropped to idle", async () => {
    await fixture.dropFromDragging();

    const result = await fixture.reset();

    expect(result.wasTransitionTaken()).toBe(true);
    expect(result.getFrom()).toBe(DragStateMachine.States.Dropped);
    expect(result.getTo()).toBe(DragStateMachine.States.Idle);
    expect(result.getOutput()?.name).toBe("drag.reset");
  });
});