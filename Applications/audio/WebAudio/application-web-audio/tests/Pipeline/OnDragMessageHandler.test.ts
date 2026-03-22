
// ============================================================================
// tests/Pipeline/Handlers/OnDragMessageHandler.spec.ts
// ============================================================================

import { describe, expect, it } from "vitest";
import { OnDragMessageHandler, DragOperation } from "../../src";
import { DragPipelineFixture } from "./DragPipelineFixture";
 
describe("OnDragMessageHandler", () => {
  const fixture = DragPipelineFixture.create();

  it("should record the operation in state store", async () => {
    fixture.withHandler(new OnDragMessageHandler(fixture.stateStore));

    const result = await fixture.execute(
      fixture.createMessage({
        operation: DragOperation.Drop,
        targetId: "shape-1",
        x: 40,
        y: 50,
      }),
    );

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().behavior).toBe("OnDragMessageHandler");
    expect(fixture.stateStore.getLastOperation("shape-1")).toBe(
      DragOperation.Drop,
    );
  });
});