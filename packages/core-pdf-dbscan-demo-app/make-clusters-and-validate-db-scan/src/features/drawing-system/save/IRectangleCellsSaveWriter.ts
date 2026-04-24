export interface IRectangleCellsSaveWriter {
    writeJson(fileName: string, json: string): Promise<void>;
}
