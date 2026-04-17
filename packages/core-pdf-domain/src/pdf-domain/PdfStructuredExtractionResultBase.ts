import { IPdfStructuredExtractionResult } from "./IPdfStructuredExtractionResult.js";

/* =================================================================================================
   PdfStructuredExtractionResultBase
   ================================================================================================= */

export abstract class PdfStructuredExtractionResultBase<TValue>
    implements IPdfStructuredExtractionResult<TValue> {
    public abstract readonly schemaName: string;
    public abstract readonly value: TValue;

    public toJSON(): IPdfStructuredExtractionResult<TValue> {
        return Object.freeze({
            schemaName: this.schemaName,
            value: this.value,
        });
    }
}
