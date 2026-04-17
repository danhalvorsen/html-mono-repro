/* =================================================================================================
   PdfJsTextStyleBase
   ================================================================================================= */

import { IPdfJsTextStyle } from "./IPdfJsTextStyle.js";

export abstract class PdfJsTextStyleBase implements IPdfJsTextStyle {
    public abstract readonly fontFamily?: string | undefined;
}
