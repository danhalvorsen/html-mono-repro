import { IPdfParserAdapterFactory } from "./IPdfParserAdapterFactory.js";
import { IPdfParserAdapter } from "./IPdfParserAdapter.js";
import { PdfJsParserAdapter } from "./PdfJsParserAdapter.js";


export class PdfJsParserAdapterFactory implements IPdfParserAdapterFactory {
    public create(): IPdfParserAdapter {
        return new PdfJsParserAdapter();
    }
}
