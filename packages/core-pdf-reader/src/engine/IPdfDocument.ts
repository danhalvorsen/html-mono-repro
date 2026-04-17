import type { IPdfMetadata } from "../IPdfMetadata.js";
import type { IPdfPage } from "./IPdfPage.js";

export interface IPdfDocument {
  readonly pageCount: number;

  readMetadata(): Promise<IPdfMetadata>;

  getPage(pageNumber: number): Promise<IPdfPage>;
}