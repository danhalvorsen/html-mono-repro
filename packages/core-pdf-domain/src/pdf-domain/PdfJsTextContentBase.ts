import { IPdfJsTextContent } from "./IPdfJsTextContent.js";
import { IPdfJsTextStyle } from "./IPdfJsTextStyle.js";

/* =================================================================================================
   PdfJsTextContentBase
   ================================================================================================= */

export abstract class PdfJsTextContentBase implements IPdfJsTextContent {
    public abstract readonly items: readonly unknown[];
    public abstract readonly styles?: Readonly<Record<string, IPdfJsTextStyle>> | undefined;
}
