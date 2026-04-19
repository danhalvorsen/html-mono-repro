import { describe, it, expect } from "vitest";
import { CommitDragTask } from "../../../../../../src/features/drawing-system/drag-system/tasks/CommitDragTask.js";
import { DragSystemFixture } from "../fixtures/DragSystemFixture.js";

describe("CommitDragTask", () => {
    const fx = new DragSystemFixture();

    it("should commit drag when hoverCell exists", async () => {
        const task = new CommitDragTask();
        const ctx = fx.createActiveContext("obj-1");
        const cell = fx.cell(5, 6);

        const result = await task.execute(fx.end(cell), ctx);

        expect(result.outputs[0].kind).toBe("drag-committed");
        expect(result.outputs[0].targetCell).toEqual(cell);
    });

    it("should cancel drag when hoverCell is null", async () => {
        const task = new CommitDragTask();
        const ctx = fx.createActiveContext("obj-1");

        const result = await task.execute(fx.end(null), ctx);

        expect(result.outputs[0].kind).toBe("drag-cancelled");
    });
});
