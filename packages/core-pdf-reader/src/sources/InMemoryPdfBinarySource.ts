import type { IPdfBinarySource } from "../IPdfBinarySource.js";

export class InMemoryPdfBinarySource implements IPdfBinarySource {
  public constructor(
    public readonly name: string,
    private readonly binary: Uint8Array,
  ) {}

  public async read(): Promise<Uint8Array> {
    return this.binary;
  }
}