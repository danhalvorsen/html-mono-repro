import { IPdfMetadata } from "../IPdfMetadata.js";
import { IPdfPageText } from "../IPdfPageText.js";
import { IPdfStructuredExtractionResult } from "../IPdfStructuredExtractionResult.js";
import { IPdfTextFragment } from "../IPdfTextFragment.js";
import { IPdfStructuredExtractionRequest } from "../services/IPdfStructuredExtractionRequest.js";

export interface ICompositePdfEngine {
  readonly name: string;

  readMetadata(binary: Uint8Array): Promise<IPdfMetadata>;

  readPageCount(binary: Uint8Array): Promise<number>;

  readPages(binary: Uint8Array): Promise<readonly IPdfPageText[]>;

  readTextFragments(binary: Uint8Array): Promise<readonly IPdfTextFragment[]>;

  extractStructured<TValue>(
    binary: Uint8Array,
    request: IPdfStructuredExtractionRequest,
  ): Promise<IPdfStructuredExtractionResult<TValue>>;
}