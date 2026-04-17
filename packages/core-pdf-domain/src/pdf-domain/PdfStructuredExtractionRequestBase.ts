/* =================================================================================================
   PdfStructuredExtractionRequestBase
   ================================================================================================= */

import { IPdfStructuredExtractionRequest } from "./IPdfStructuredExtractionRequest.js";

export abstract class PdfStructuredExtractionRequestBase<TSchemaName extends string = string>
    implements IPdfStructuredExtractionRequest<TSchemaName> {
    public abstract readonly schemaName: TSchemaName;
    public abstract readonly prompt?: string | undefined;

    public toJSON(): IPdfStructuredExtractionRequest<TSchemaName> {
        return Object.freeze({
            schemaName: this.schemaName,
            ...(this.prompt !== undefined && { prompt: this.prompt }),
        });
    }
}
