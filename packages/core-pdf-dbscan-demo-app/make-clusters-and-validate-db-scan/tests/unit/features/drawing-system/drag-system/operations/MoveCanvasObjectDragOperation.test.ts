import { describe, it, expect } from "vitest";
import { MoveCanvasObjectDragOperation } from "../../../../../../src/features/drawing-system/drag-system/operations/MoveCanvasObjectDragOperation.js";
import { DragSystemFixture } from "../fixtures/DragSystemFixture.js";

describe("MoveCanvasObjectDragOperation", () => {
    const fx = new DragSystemFixture();

    it("should execute full drag workflow", async () => {
        const op = new MoveCanvasObjectDragOperation();
        const cell = fx.cell(2, 2);

        const start = await op.dispatch(fx.begin("obj-1"));
        expect(start[0].kind).toBe("drag-started");

        const move = await op.dispatch(fx.move(cell));
        expect(move[0].kind).toBe("drag-hover-changed");

        const end = await op.dispatch(fx.end(cell));
        expect(end[0].kind).toBe("drag-committed");
    });

    it("should cancel when drop without cell", async () => {
        const op = new MoveCanvasObjectDragOperation();

        await op.dispatch(fx.begin("obj-1"));
        const result = await op.dispatch(fx.end(null));

        expect(result[0].kind).toBe("drag-cancelled");
    });

    it("should ignore move without start", async () => {
        const op = new MoveCanvasObjectDragOperation();

        const result = await op.dispatch(fx.move(null));

        expect(result.length).toBe(0);
    });
});
