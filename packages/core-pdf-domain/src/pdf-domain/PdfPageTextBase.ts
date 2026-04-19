import { IPdfPageText } from "./IPdfPageText.js";

/* =================================================================================================
   PdfPageTextBase
   ================================================================================================= */

export abstract class PdfPageTextBase implements IPdfPageText {
    public abstract readonly pageNumber: number;
    public abstract readonly text: string;

    public toJSON(): IPdfPageText {
        return Object.freeze({
            pageNumber: this.pageNumber,
            text: this.text,
        });
    }
}
