import type { IPdfBinarySource } from "../IPdfBinarySource.js";
import type { IPdfPageText } from "../IPdfPageText.js";
import type { IPdfReader } from "../IPdfReader.js";
import type { ICompositePdfEngine } from "../engine/ICompositePdfEngine.js";

export class DefaultPdfReader implements IPdfReader {
  public constructor(
    private readonly engine: ICompositePdfEngine,
  ) {}

  public readonly read = async (
    source: IPdfBinarySource,
  ): Promise<readonly IPdfPageText[]> => {
    const binary = await source.read();
    return this.engine.readPages(binary);
  };
}