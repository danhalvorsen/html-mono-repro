import { IPdfJsPageProxy } from "./IPdfJsPageProxy.js";
import { IPdfJsTextContent } from "./IPdfJsTextContent.js";
import { IPdfJsViewport } from "./IPdfJsViewport.js";

/* =================================================================================================
   PdfJsPageProxyBase
   ================================================================================================= */

export abstract class PdfJsPageProxyBase implements IPdfJsPageProxy {
    public abstract readonly pageNumber: number;
    public abstract getTextContent(): Promise<IPdfJsTextContent>;
    public abstract getViewport(parameters: { scale: number; }): IPdfJsViewport;
}
