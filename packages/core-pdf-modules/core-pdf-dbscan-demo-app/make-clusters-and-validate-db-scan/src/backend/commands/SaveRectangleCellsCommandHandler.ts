import { mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { Err, Ok, type Result } from "@monorepo/core-design-patterns";
import { CommandHandler, type ICommand } from "@monorepo/core-design-patterns-cqrs";
import {
    SaveRectangleCellsCommand,
    type ISaveRectangleCellsResult
} from "./SaveRectangleCellsCommand.js";

export class SaveRectangleCellsCommandHandler extends CommandHandler<
    SaveRectangleCellsCommand,
    ISaveRectangleCellsResult,
    string
> {
    private readonly savedDirectoryPath: string;

    public constructor(savedDirectoryPath: string) {
        super();
        this.savedDirectoryPath = savedDirectoryPath;
    }

    public override async Handle(
        command: ICommand<SaveRectangleCellsCommand>
    ): Promise<Result<ISaveRectangleCellsResult, string>> {
        try {
            const payload = this.parseCommand(command);
            const savedFilePath = this.resolveSavedJsonPath(payload.fileName);

            await mkdir(this.savedDirectoryPath, { recursive: true });
            await writeFile(savedFilePath, payload.json, "utf8");

            return Ok({
                fileName: payload.fileName,
                path: savedFilePath
            });
        }
        catch (error) {
            return Err(error instanceof Error ? error.message : "Unexpected save error.");
        }
    }

    private parseCommand(command: ICommand<SaveRectangleCellsCommand>): SaveRectangleCellsCommand {
        const parsed = JSON.parse(command.json) as Partial<SaveRectangleCellsCommand>;

        if (typeof parsed.fileName !== "string" || typeof parsed.json !== "string") {
            throw new Error("Expected { fileName: string, json: string }.");
        }

        return new SaveRectangleCellsCommand(parsed.fileName, parsed.json);
    }

    private resolveSavedJsonPath(fileName: string): string {
        if (fileName !== basename(fileName) || !fileName.endsWith(".json")) {
            throw new Error("fileName must be a local .json file name.");
        }

        return join(this.savedDirectoryPath, fileName);
    }
}
