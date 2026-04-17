import { describe, it, expect } from "vitest";
import { CanvasObjectFactory } from "../../src/drawing/CanvasObjectFactory.js";
import { CanvasObjectBuilder } from "../../src/drawing/CanvasObjectBuilder.js";
import { IncrementingCanvasObjectIdGenerator } from "../../src/drawing/IncrementingCanvasObjectIdGenerator.js";
import { CanvasObjectKinds } from "../../src/drawing/CanvasObjectKind.js";

describe("CanvasObjectFactory", () => {
    it("should create a valid canvas object when input is valid", () => {
        const sut = new CanvasObjectFactory(
            new IncrementingCanvasObjectIdGenerator(),
            () => new CanvasObjectBuilder()
        );

        const result = sut.createAtCell(CanvasObjectKinds.circle, 2, 3);

        expect(result.id).toBe("canvas-object-1");
        expect(result.kind).toBe(CanvasObjectKinds.circle);
        expect(result.cell.column).toBe(2);
        expect(result.cell.row).toBe(3);
    });

    it("should generate deterministic incremental identifiers", () => {
        const sut = new CanvasObjectFactory(
            new IncrementingCanvasObjectIdGenerator(),
            () => new CanvasObjectBuilder()
        );

        const first = sut.createAtCell(CanvasObjectKinds.rectangle, 0, 0);
        const second = sut.createAtCell(CanvasObjectKinds.rectangle, 1, 1);

        expect(first.id).toBe("canvas-object-1");
        expect(second.id).toBe("canvas-object-2");
    });
});
