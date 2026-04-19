// ============================================================================
// ============================================================================
import type { IPdfJsTextContent } from "./IPdfJsTextContent.js";
import type { IPdfJsViewport } from "./IPdfJsViewport.js";

export interface IPdfJsPageProxy {
    readonly pageNumber: number;
    getTextContent(): Promise<IPdfJsTextContent>;
    getViewport(parameters: { scale: number; }): IPdfJsViewport;
}
