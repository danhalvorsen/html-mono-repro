import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { IRectangleCellsSaveWriter } from "../../../../../src/features/drawing-system/save/IRectangleCellsSaveWriter.js";
import { RectangleCellsSaveAction } from "../../../../../src/features/drawing-system/save/RectangleCellsSaveAction.js";
import { InMemoryDrawingObjectStore } from "../../../../../src/features/drawing-system/canvas-object/stores/InMemoryDrawingObjectStore.js";
import { CanvasObjectKinds } from "../../../../../src/features/drawing-system/canvas-object/value-objects/CanvasObjectKind.js";

class SavedDirectoryRectangleCellsSaveWriter implements IRectangleCellsSaveWriter {
    private readonly directoryPath: string;

    public constructor(directoryPath: string) {
        this.directoryPath = directoryPath;
    }

    public async writeJson(fileName: string, json: string): Promise<void> {
        await mkdir(this.directoryPath, { recursive: true });
        await writeFile(join(this.directoryPath, fileName), json, "utf8");
    }
}

describe("RectangleCellsSaveAction", () => {
    const savedDirectoryPath = join(process.cwd(), "saved");
    const savedFileName = "rectangle-cells.test.json";
    const savedFilePath = join(savedDirectoryPath, savedFileName);

    afterEach(async () => {
        await rm(savedFilePath, { force: true });
    });

    it("should store rectangle cell json under saved when save is executed", async () => {
        const store = new InMemoryDrawingObjectStore([
            {
                id: "rectangle-1",
                kind: CanvasObjectKinds.rectangle,
                cell: {
                    column: 2,
                    row: 3
                }
            },
            {
                id: "circle-1",
                kind: CanvasObjectKinds.circle,
                cell: {
                    column: 4,
                    row: 5
                }
            },
            {
                id: "rectangle-2",
                kind: CanvasObjectKinds.rectangle,
                cell: {
                    column: 6,
                    row: 7
                }
            }
        ]);

        const sut = new RectangleCellsSaveAction(
            store,
            new SavedDirectoryRectangleCellsSaveWriter(savedDirectoryPath),
            savedFileName
        );

        const result = await sut.execute();
        const savedJson = await readFile(savedFilePath, "utf8");
        const savedFile = JSON.parse(savedJson) as unknown;

        expect(savedFile).toEqual({
            rectangles: [
                {
                    id: "rectangle-1",
                    kind: CanvasObjectKinds.rectangle,
                    cell: {
                        column: 2,
                        row: 3
                    }
                },
                {
                    id: "rectangle-2",
                    kind: CanvasObjectKinds.rectangle,
                    cell: {
                        column: 6,
                        row: 7
                    }
                }
            ]
        });
        expect(result).toEqual(savedFile);
    });
});
