import { IPdfDocument } from "./IPdfDocument.js";
import { IPdfDocumentFactory } from "./IPdfDocumentFactory.js";

/* =================================================================================================
   PdfDocumentFactoryBase
   ================================================================================================= */

export abstract class PdfDocumentFactoryBase implements IPdfDocumentFactory {
    public abstract open(binary: Uint8Array): Promise<IPdfDocument>;
}
