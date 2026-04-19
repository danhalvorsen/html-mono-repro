import { IPdfParserDocument } from "./IPdfParserDocument.js";


export interface IPdfParserAdapter {
    readonly name: string;
    open(pdfBinary: Uint8Array): Promise<IPdfParserDocument>;
}
