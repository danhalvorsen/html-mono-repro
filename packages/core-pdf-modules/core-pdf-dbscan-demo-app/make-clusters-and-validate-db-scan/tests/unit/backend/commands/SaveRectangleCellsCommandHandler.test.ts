import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it, afterEach } from "vitest";
import { SaveRectangleCellsCommandHandler } from "../../../../src/backend/commands/SaveRectangleCellsCommandHandler.js";

describe("SaveRectangleCellsCommandHandler", () => {
    const savedDirectoryPath = join(process.cwd(), "saved");
    const savedFileName = "rectangle-cells.command.test.json";
    const savedFilePath = join(savedDirectoryPath, savedFileName);

    afterEach(async () => {
        await rm(savedFilePath, { force: true });
    });

    it("should handle a save command by writing rectangle cell json under saved", async () => {
        const json = JSON.stringify({
            rectangles: [
                {
                    id: "rectangle-1",
                    kind: "rectangle",
                    cell: {
                        column: 1,
                        row: 2
                    }
                }
            ]
        });
        const sut = new SaveRectangleCellsCommandHandler(savedDirectoryPath);

        const result = await sut.Handle({
            json: JSON.stringify({
                fileName: savedFileName,
                json
            })
        });

        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual({
            fileName: savedFileName,
            path: savedFilePath
        });
        await expect(readFile(savedFilePath, "utf8")).resolves.toBe(json);
    });

    it("should return an error result when the command file name escapes saved", async () => {
        const sut = new SaveRectangleCellsCommandHandler(savedDirectoryPath);

        const result = await sut.Handle({
            json: JSON.stringify({
                fileName: "../rectangle-cells.json",
                json: "{}"
            })
        });

        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr()).toBe("fileName must be a local .json file name.");
    });
});
