import type { IPdfDocument } from "./IPdfDocument.js";

export interface IPdfDocumentFactory {
  open(binary: Uint8Array): Promise<IPdfDocument>;
}