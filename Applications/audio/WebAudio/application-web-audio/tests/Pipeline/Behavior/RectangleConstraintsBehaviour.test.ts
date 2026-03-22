
// ============================================================================
// tests/Pipeline/Behaviors/RectangleConstraintsBehaviour.spec.ts
// ============================================================================

import { describe, expect, it } from "vitest";
import { DragPipelineFixture } from "../DragPipelineFixture";
import { DragOperation, RectangleConstraintsBehaviour } from "../../../src";

describe("RectangleConstraintsBehaviour", () => {
  const fixture = DragPipelineFixture.create();

  it("should continue when no bounds are registered", async () => {
    const handler = fixture.createHandlerSpy();

    fixture
      .withBehavior(new RectangleConstraintsBehaviour(fixture.stateStore))
      .withHandler(handler);

    const result = await fixture.execute(
      fixture.createMessage({
        operation: DragOperation.Move,
        targetId: "shape-1",
        x: 10,
        y: 20,
      }),
    );

    expect(result.isOk()).toBe(true);
    expect(handler.wasHandled()).toBe(true);
  });

  it("should fail when point is outside bounds", async () => {
    fixture
      .setBounds({
        minX: 0,
        minY: 0,
        maxX: 50,
        maxY: 50,
      })
      .withBehavior(new RectangleConstraintsBehaviour(fixture.stateStore));

    const result = await fixture.execute(
      fixture.createMessage({
        operation: DragOperation.Move,
        targetId: "shape-1",
        x: 100,
        y: 120,
      }),
    );

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().behavior).toBe("RectangleConstraintsBehaviour");
  });

  it("should continue when point is inside bounds", async () => {
    const handler = fixture.createHandlerSpy();

    fixture
      .setBounds({
        minX: 0,
        minY: 0,
        maxX: 50,
        maxY: 50,
      })
      .withBehavior(new RectangleConstraintsBehaviour(fixture.stateStore))
      .withHandler(handler);

    const result = await fixture.execute(
      fixture.createMessage({
        operation: DragOperation.Move,
        targetId: "shape-1",
        x: 25,
        y: 30,
      }),
    );

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().behavior).toBe("HandlerSpy");
    expect(handler.wasHandled()).toBe(true);
  });
});
