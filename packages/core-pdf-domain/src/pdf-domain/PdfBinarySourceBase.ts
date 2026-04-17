import { IPdfBinarySource } from "./IPdfBinarySource.js";

/* =================================================================================================
   PdfBinarySourceBase
   ================================================================================================= */

export abstract class PdfBinarySourceBase implements IPdfBinarySource {
    public abstract readonly name: string;
    public abstract read(): Promise<Uint8Array>;
}
