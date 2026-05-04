import { describe, it, expect } from "vitest";
import { CancelDragTask } from "../../../../../../src/features/drawing-system/drag-system/tasks/CancelDragTask.js";
import { DragSystemFixture } from "../fixtures/DragSystemFixture.js";

describe("CancelDragTask", () => {
    const fx = new DragSystemFixture();

    it("should cancel active drag", async () => {
        const task = new CancelDragTask();
        const ctx = fx.createActiveContext("obj-1");

        const result = await task.execute(fx.cancel(), ctx);

        expect(result.outputs[0].kind).toBe("drag-cancelled");
    });

    it("should not handle when no active drag", () => {
        const task = new CancelDragTask();
        const ctx = fx.createDefaultContext();

        const can = task.canHandle(fx.cancel(), ctx);

        expect(can).toBe(false);
    });
});
