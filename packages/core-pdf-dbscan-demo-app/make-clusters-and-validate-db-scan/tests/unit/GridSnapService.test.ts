import { describe, it, expect } from "vitest";
import { GridSnapService } from "../../src/features/drawing-system/grid/services/GridSnapService.js";

describe("GridSnapService", () => {
    it("should snap to the expected cell when the pointer is inside the stage", () => {
        const sut = new GridSnapService();

        const result = sut.trySnap({
            clientX: 250,
            clientY: 150,
            stageLeft: 0,
            stageTop: 0,
            stageWidth: 500,
            stageHeight: 500,
            canvasWidth: 500,
            canvasHeight: 500,
            cellWidth: 100,
            cellHeight: 100,
            columns: 5,
            rows: 5
        });

        expect(result).not.toBeNull();
        expect(result?.column).toBe(2);
        expect(result?.row).toBe(1);
    });

    it("should return null when the pointer is outside the stage", () => {
        const sut = new GridSnapService();

        const result = sut.trySnap({
            clientX: 900,
            clientY: 900,
            stageLeft: 0,
            stageTop: 0,
            stageWidth: 500,
            stageHeight: 500,
            canvasWidth: 500,
            canvasHeight: 500,
            cellWidth: 100,
            cellHeight: 100,
            columns: 5,
            rows: 5
        });

        expect(result).toBeNull();
    });

    it("should clamp to the last valid cell when the pointer reaches the stage edge", () => {
        const sut = new GridSnapService();

        const result = sut.trySnap({
            clientX: 499,
            clientY: 499,
            stageLeft: 0,
            stageTop: 0,
            stageWidth: 500,
            stageHeight: 500,
            canvasWidth: 500,
            canvasHeight: 500,
            cellWidth: 100,
            cellHeight: 100,
            columns: 5,
            rows: 5
        });

        expect(result).not.toBeNull();
        expect(result?.column).toBe(4);
        expect(result?.row).toBe(4);
    });
});
