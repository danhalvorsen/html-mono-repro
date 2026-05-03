import { IPdfMetadata } from "@monorepo/core-pdf-domain";
import { IPdfParserPage } from "./IPdfParserPage.js";

/* =================================================================================================
   Adapter public abstractions
   ================================================================================================= */

export interface IPdfParserDocument {
    readonly pageCount: number;
    readMetadata(): Promise<IPdfMetadata>;
    getPage(pageNumber: number): Promise<IPdfParserPage>;
}
