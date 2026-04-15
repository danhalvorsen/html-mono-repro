
import { IPdfBinarySource } from "../IPdfBinarySource.js";

export class InMemoryPdfBinarySource implements IPdfBinarySource {
  constructor(public readonly name: string, private readonly binary: Uint8Array) {}

  async read(): Promise<Uint8Array> {
    return this.binary;
  }
}
