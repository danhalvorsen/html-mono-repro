import type { IPdfBinarySource } from "../IPdfBinarySource.js";

export class InMemoryPdfBinarySource implements IPdfBinarySource {
  public constructor(
    public readonly name: string,
    binary: Uint8Array,
  ) {
    this.binary = new Uint8Array(binary);
  }

  private readonly binary: Uint8Array;

  public async read(): Promise<Uint8Array> {
    return new Uint8Array(this.binary);
  }
}
