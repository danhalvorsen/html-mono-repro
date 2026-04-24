import type { PdfFragment } from "@monorepo/core-pdf-domain";
import type { IPdfBinarySource } from "../IPdfBinarySource.js";
import type { IPdfPageText } from "../IPdfPageText.js";
import type { IPdfReader } from "../IPdfReader.js";
import type { IPdfEngine } from "../engine/IPdfEngine.js";

export class PdfReader implements IPdfReader {
  public constructor(private readonly engine: IPdfEngine) {}

  public readonly readFragments = async (
    source: IPdfBinarySource,
  ): Promise<readonly PdfFragment[]> => {
    const binary = await source.read();
    return this.engine.readFragments(binary);
  };

  public readonly read = async (
    source: IPdfBinarySource,
  ): Promise<readonly IPdfPageText[]> => {
    const binary = await source.read();
    return this.engine.readPages(binary);
  };
}
