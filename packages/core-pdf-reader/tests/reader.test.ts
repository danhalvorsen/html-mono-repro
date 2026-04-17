import { describe, expect, it } from "vitest";
import { DefaultPdfReader } from "../src/services/DefaultPdfReader.js";
import { InMemoryPdfBinarySource } from "../src/sources/InMemoryPdfBinarySource.js";
import type { ICompositePdfEngine } from "../src/engine/ICompositePdfEngine.js";
import type { IPdfMetadata } from "../src/IPdfMetadata.js";
import type { IPdfPageText } from "../src/IPdfPageText.js";
import type { IPdfStructuredExtractionRequest } from "../src/services/IPdfStructuredExtractionRequest.js";
import type { IPdfStructuredExtractionResult } from "../src/IPdfStructuredExtractionResult.js";
import type { IPdfTextFragment } from "../src/IPdfTextFragment.js";

class FakeCompositePdfEngine implements ICompositePdfEngine {
  public readonly name = "fake";

  public async readMetadata(_binary: Uint8Array): Promise<IPdfMetadata> {
    return {};
  }

  public async readPageCount(_binary: Uint8Array): Promise<number> {
    return 2;
  }

  public async readPages(_binary: Uint8Array): Promise<readonly IPdfPageText[]> {
    return Object.freeze([
      Object.freeze({ pageNumber: 1, text: "Page 1 text" }),
      Object.freeze({ pageNumber: 2, text: "Page 2 text" }),
    ]);
  }

  public async readTextFragments(_binary: Uint8Array): Promise<readonly IPdfTextFragment[]> {
    return Object.freeze([]);
  }

  public async extractStructured<TValue>(
    _binary: Uint8Array,
    request: IPdfStructuredExtractionRequest,
  ): Promise<IPdfStructuredExtractionResult<TValue>> {
    return Object.freeze({
      schemaName: request.schemaName,
      value: {} as TValue,
    });
  }
}

describe("DefaultPdfReader", () => {
  it("should read pages from engine", async () => {
    const reader = new DefaultPdfReader(new FakeCompositePdfEngine());

    const source = new InMemoryPdfBinarySource(
      "test.pdf",
      new Uint8Array([1, 2, 3]),
    );

    const result = await reader.read(source);

    expect(result).toEqual([
      { pageNumber: 1, text: "Page 1 text" },
      { pageNumber: 2, text: "Page 2 text" },
    ]);
  });
});