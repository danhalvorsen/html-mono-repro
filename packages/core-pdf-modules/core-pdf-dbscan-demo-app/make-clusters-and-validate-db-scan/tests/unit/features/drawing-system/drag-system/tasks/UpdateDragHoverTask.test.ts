import { describe, it, expect } from "vitest";
import { UpdateDragHoverTask } from "../../../../../../src/features/drawing-system/drag-system/tasks/UpdateDragHoverTask.js";
import { DragSystemFixture } from "../fixtures/DragSystemFixture.js";

describe("UpdateDragHoverTask", () => {
    const fx = new DragSystemFixture();

    it("should update hover when active drag exists", async () => {
        const task = new UpdateDragHoverTask();
        const ctx = fx.createActiveContext("obj-1");
        const cell = fx.cell(3, 4);

        const result = await task.execute(fx.move(cell), ctx);

        expect(result.context.hoverCell).toEqual(cell);
        expect(result.outputs[0].kind).toBe("drag-hover-changed");
    });

    it("should not handle when no active drag", () => {
        const task = new UpdateDragHoverTask();
        const ctx = fx.createDefaultContext();

        const can = task.canHandle(fx.move(null), ctx);

        expect(can).toBe(false);
    });
});
