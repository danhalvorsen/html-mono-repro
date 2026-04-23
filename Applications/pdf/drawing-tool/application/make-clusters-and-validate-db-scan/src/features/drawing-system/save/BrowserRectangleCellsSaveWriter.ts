import type { IRectangleCellsSaveWriter } from "./IRectangleCellsSaveWriter.js";
import type { IRectangleSaveCompensation } from "./IRectangleCellsSaveWriter.js";

export class BrowserRectangleCellsSaveWriter implements IRectangleCellsSaveWriter {
    public async writeJson(
        fileName: string,
        json: string,
        _compensation?: IRectangleSaveCompensation
    ): Promise<void> {
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = fileName;
        anchor.click();

        URL.revokeObjectURL(url);
    }
}
