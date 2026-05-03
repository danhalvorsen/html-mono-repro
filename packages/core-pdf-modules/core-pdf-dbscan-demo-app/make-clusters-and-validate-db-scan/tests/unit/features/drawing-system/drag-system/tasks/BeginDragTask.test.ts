import { describe, it, expect } from "vitest";
import { BeginDragTask } from "../../../../../../src/features/drawing-system/drag-system/tasks/BeginDragTask.js";
import { DragSystemFixture } from "../fixtures/DragSystemFixture.js";

describe("BeginDragTask", () => {
    const fx = new DragSystemFixture();

    it("should start drag when objectId is valid", async () => {
        const task = new BeginDragTask();
        const ctx = fx.createDefaultContext();
        const input = fx.begin("obj-1");

        const result = await task.execute(input, ctx);

        expect(result.context.activeObjectId).toBe("obj-1");
        expect(result.outputs.length).toBe(1);
        expect(result.outputs[0].kind).toBe("drag-started");
    });

    it("should not handle empty objectId", () => {
        const task = new BeginDragTask();
        const ctx = fx.createDefaultContext();
        const input = fx.begin("");

        const can = task.canHandle(input, ctx);

        expect(can).toBe(false);
    });
});
