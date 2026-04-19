import type { ICommandBase } from "@monorepo/core-design-patterns-cqrs";

export class SaveRectangleCellsCommand implements ICommandBase {
    public readonly fileName: string;
    public readonly json: string;

    public constructor(fileName: string, json: string) {
        this.fileName = fileName;
        this.json = json;
    }
}

export interface ISaveRectangleCellsResult {
    readonly fileName: string;
    readonly path: string;
}
