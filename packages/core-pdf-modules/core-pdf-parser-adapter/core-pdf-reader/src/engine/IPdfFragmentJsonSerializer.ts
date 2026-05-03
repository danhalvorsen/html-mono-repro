import type { PdfFragment } from "@monorepo/core-pdf-domain";

export interface IPdfFragmentJsonSerializer {
  serialize(engineName: string, fragments: readonly PdfFragment[]): Uint8Array;
}
