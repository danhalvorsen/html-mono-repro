import { IPdfMetadata } from "../IPdfMetadata.js";
import { IPdfPageText } from "../IPdfPageText.js";
import { IPdfTextFragment } from "../IPdfTextFragment.js";
import type { PdfFragment } from "@monorepo/core-pdf-domain";

export interface IPdfEngine {
  readonly name: string;

  readMetadata(binary: Uint8Array): Promise<IPdfMetadata>;

  readPageCount(binary: Uint8Array): Promise<number>;

  readPages(binary: Uint8Array): Promise<readonly IPdfPageText[]>;

  readFragments(binary: Uint8Array): Promise<readonly PdfFragment[]>;

  readTextFragments(binary: Uint8Array): Promise<readonly IPdfTextFragment[]>;
}
