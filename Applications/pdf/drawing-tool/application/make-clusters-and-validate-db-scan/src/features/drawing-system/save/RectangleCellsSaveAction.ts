import type { IDrawingObjectStore } from "../canvas-object/stores/IDrawingObjectStore.js";
import type {
    IRectangleCellsSaveWriter,
    IRectangleSaveCompensation
} from "./IRectangleCellsSaveWriter.js";
import {
    createRectangleCellsSaveFile,
    type IRectangleCellsSaveFile
} from "./RectangleCellsSaveFile.js";

export class RectangleCellsSaveAction {
    private readonly drawingObjectStore: IDrawingObjectStore;
    private readonly writer: IRectangleCellsSaveWriter;
    private readonly fileName: string;

    public constructor(
        drawingObjectStore: IDrawingObjectStore,
        writer: IRectangleCellsSaveWriter,
        fileName: string = "rectangle-cells.json"
    ) {
        this.drawingObjectStore = drawingObjectStore;
        this.writer = writer;
        this.fileName = fileName;
    }

    public async execute(compensation?: IRectangleSaveCompensation): Promise<IRectangleCellsSaveFile> {
        const saveFile = createRectangleCellsSaveFile(this.drawingObjectStore.getAll());
        const json = JSON.stringify(saveFile, null, 2);

        await this.writer.writeJson(this.fileName, json, compensation);

        return saveFile;
    }
}
