
// ============================================================================
// tests/Pipeline/Behaviors/VisibleBehavior.spec.ts
// ============================================================================

import { describe, expect, it } from "vitest";
import { DragPipelineFixture } from "./DragPipelineFixture";
import { DragOperation, VisibleBehavior } from "../../src";

describe("VisibleBehavior", () => {
  const fixture = DragPipelineFixture.create();

  it("should fail when target is not visible", async () => {
    fixture.withBehavior(new VisibleBehavior(fixture.stateStore));

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
  });

  it("should continue to handler when target is visible", async () => {
    const handler = fixture.createHandlerSpy();

    fixture
      .setVisible("shape-1")
      .withBehavior(new VisibleBehavior(fixture.stateStore))
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
    expect(result.unwrap().behavior).toBe("HandlerSpy");
    expect(handler.wasHandled()).toBe(true);
  });
});
