import { IPdfJsViewport } from "./IPdfJsViewport.js";

/* =================================================================================================
   PdfJsViewportBase
   ================================================================================================= */

export abstract class PdfJsViewportBase implements IPdfJsViewport {
    public abstract readonly width: number;
    public abstract readonly height: number;
    public abstract readonly scale: number;
    public abstract readonly transform: readonly number[];
}
