import { IPdfParserAdapter } from "./IPdfParserAdapter.js";


export interface IPdfParserAdapterFactory {
    create(): IPdfParserAdapter;
}
