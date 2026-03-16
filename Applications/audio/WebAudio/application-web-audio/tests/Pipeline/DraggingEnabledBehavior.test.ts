
import { describe, expect, it } from "vitest";
import { DragPipelineFixture } from "./DragPipelineFixture";
import { DraggingEnabledBehavior, DragOperation } from "../../src";
 
describe("DraggingEnabledBehavior", () => {
  const fixture = DragPipelineFixture.create();

  it("should fail when dragging is disabled", async () => {
    fixture
      .disableDragging()
      .withBehavior(new DraggingEnabledBehavior(fixture.stateStore));

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
  });

  it("should continue to handler when dragging is enabled", async () => {
    const handler = fixture.createHandlerSpy();

    fixture
      .enableDragging()
      .withBehavior(new DraggingEnabledBehavior(fixture.stateStore))
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
