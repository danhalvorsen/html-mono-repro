import { IPdfDocument } from "./IPdfDocument.js";
import { IPdfMetadata } from "./IPdfMetadata.js";
import { IPdfPage } from "./IPdfPage.js";

/* =================================================================================================
   PdfDocumentBase
   ================================================================================================= */

export abstract class PdfDocumentBase implements IPdfDocument {
    public abstract get pageCount(): number;
    public abstract readMetadata(): Promise<IPdfMetadata>;
    protected abstract readPageCore(pageNumber: number): Promise<IPdfPage>;

    public async getPage(pageNumber: number): Promise<IPdfPage> {
        this.ensureValidPageNumber(pageNumber);
        return this.readPageCore(pageNumber);
    }

    protected ensureValidPageNumber(pageNumber: number): void {
        if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > this.pageCount) {
            throw new RangeError(`Invalid PDF page number '${pageNumber}'.`);
        }
    }
}
