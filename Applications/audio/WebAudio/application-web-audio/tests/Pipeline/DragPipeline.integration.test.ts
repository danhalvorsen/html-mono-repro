// ============================================================================
// tests/Pipeline/DragPipeline.integration.spec.ts
// ============================================================================

import { describe, expect, it } from "vitest";

import { DragOperation , OnDragMessageHandler , RectangleConstraintsBehaviour, VisibleBehavior, DraggingEnabledBehavior } from "../../src/index.js";
import { DragPipelineFixture } from "./DragPipelineFixture.js";

describe("DragPipeline integration", () => {
  const fixture = DragPipelineFixture.create();

  it("should stop at first failing behavior", async () => {
    const handler = fixture.createHandlerSpy();

    fixture
      .disableDragging()
      .withBehaviors([
        new DraggingEnabledBehavior(fixture.stateStore),
        new VisibleBehavior(fixture.stateStore),
        new RectangleConstraintsBehaviour(fixture.stateStore),
      ])
      .withHandler(handler);

    const result = await fixture.execute(
      fixture.createMessage({
        operation: DragOperation.Move,
        targetId: "shape-1",
        x: 10,
        y: 20,
      }),
    );

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().behavior).toBe("DraggingEnabledBehavior");
    expect(handler.wasHandled()).toBe(false);
  });

  it("should stop at visible behavior when dragging is enabled but target is hidden", async () => {
    const handler = fixture.createHandlerSpy();

    fixture
      .enableDragging()
      .setHidden("shape-1")
      .withBehaviors([
        new DraggingEnabledBehavior(fixture.stateStore),
        new VisibleBehavior(fixture.stateStore),
        new RectangleConstraintsBehaviour(fixture.stateStore),
      ])
      .withHandler(handler);

    const result = await fixture.execute(
      fixture.createMessage({
        operation: DragOperation.Move,
        targetId: "shape-1",
        x: 10,
        y: 20,
      }),
    );

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().behavior).toBe("VisibleBehavior");
    expect(handler.wasHandled()).toBe(false);
  });

  it("should stop at rectangle constraints behavior when point is out of bounds", async () => {
    const handler = fixture.createHandlerSpy();

    fixture
      .enableDragging()
      .setVisible("shape-1")
      .setBounds({
        minX: 0,
        minY: 0,
        maxX: 50,
        maxY: 50,
      })
      .withBehaviors([
        new DraggingEnabledBehavior(fixture.stateStore),
        new VisibleBehavior(fixture.stateStore),
        new RectangleConstraintsBehaviour(fixture.stateStore),
      ])
      .withHandler(handler);

    const result = await fixture.execute(
      fixture.createMessage({
        operation: DragOperation.Move,
        targetId: "shape-1",
        x: 200,
        y: 300,
      }),
    );

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().behavior).toBe("RectangleConstraintsBehaviour");
    expect(handler.wasHandled()).toBe(false);
  });

  it("should execute handler when all behaviors pass", async () => {
    fixture
      .enableDragging()
      .setVisible("shape-1")
      .setBounds({
        minX: 0,
        minY: 0,
        maxX: 50,
        maxY: 50,
      })
      .withBehaviors([
        new DraggingEnabledBehavior(fixture.stateStore),
        new VisibleBehavior(fixture.stateStore),
        new RectangleConstraintsBehaviour(fixture.stateStore),
      ])
      .withHandler(new OnDragMessageHandler(fixture.stateStore));

    const result = await fixture.execute(
      fixture.createMessage({
        operation: DragOperation.Move,
        targetId: "shape-1",
        x: 25,
        y: 25,
      }),
    );

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().behavior).toBe("OnDragMessageHandler");
    expect(fixture.stateStore.getLastOperation("shape-1")).toBe(
      DragOperation.Move,
    );
  });
});