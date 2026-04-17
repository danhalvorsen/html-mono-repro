import { ICompositePdfEngine } from "./ICompositePdfEngine.js";
import { IPdfBinarySource } from "./IPdfBinarySource.js";
import { IPdfPageText } from "./IPdfPageText.js";
import { IPdfReader } from "./IPdfReader.js";

/* =================================================================================================
   PdfReaderBase
   ================================================================================================= */

export abstract class PdfReaderBase implements IPdfReader {
    protected constructor(
        protected readonly engine: ICompositePdfEngine
    ) { }

    public readonly read = async (source: IPdfBinarySource): Promise<readonly IPdfPageText[]> => {
        const binary = await source.read();
        return this.engine.readPages(binary);
    };
}
