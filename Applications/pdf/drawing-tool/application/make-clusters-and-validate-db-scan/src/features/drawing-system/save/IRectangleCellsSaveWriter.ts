export interface IRectangleSaveCompensation {
    readonly cellWidth: number;
    readonly cellHeight: number;
    readonly inset?: number;
}

export interface IRectangleCellsSaveWriter {
    writeJson(
        fileName: string,
        json: string,
        compensation?: IRectangleSaveCompensation
    ): Promise<void>;
}
