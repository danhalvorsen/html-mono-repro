import { IPdfJsDocumentProxy } from "./IPdfJsDocumentProxy.js";
import { IPdfJsPageProxy } from "./IPdfJsPageProxy.js";

/* =================================================================================================
   PdfJsDocumentProxyBase
   ================================================================================================= */

export abstract class PdfJsDocumentProxyBase implements IPdfJsDocumentProxy {
    public abstract readonly numPages: number;
    public abstract getPage(pageNumber: number): Promise<IPdfJsPageProxy>;
    public abstract getMetadata(): Promise<{ info?: object | undefined; }>;
}
