import { describe, expect, it } from "vitest";

import { FragmentKinds, type IPdfFragment } from "@monorepo/core-pdf-domain";

import type { IPdfMetadata } from "../src/IPdfMetadata.js";
import type { IPdfPageText } from "../src/IPdfPageText.js";
import type { IPdfTextFragment } from "../src/IPdfTextFragment.js";
import type { IPdfEngine } from "../src/engine/IPdfEngine.js";
import { PdfReader } from "../src/services/PdfReader.js";
import { InMemoryPdfBinarySource } from "../src/sources/InMemoryPdfBinarySource.js";

class FakePdfEngine implements IPdfEngine {
  public readonly name = "fake";

  public constructor(
    private readonly fragments: readonly IPdfFragment[] = Object.freeze([]),
  ) {}

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

  public async readFragments(_binary: Uint8Array): Promise<readonly IPdfFragment[]> {
    return this.fragments;
  }

  public async readTextFragments(_binary: Uint8Array): Promise<readonly IPdfTextFragment[]> {
    return Object.freeze([]);
  }
}

describe("PdfReader", () => {
  it("should read pages from engine", async () => {
    const reader = new PdfReader(new FakePdfEngine());
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

  it("should return fragments exactly as provided by the engine", async () => {
    const fragments: readonly IPdfFragment[] = Object.freeze([
      Object.freeze({
        kind: FragmentKinds.Text,
        pageNumber: 1,
        text: "A",
        boundingBox: Object.freeze({
          position: Object.freeze({ x: 0, y: 0 }),
          width: 10,
          height: 10,
        }),
      }),
      Object.freeze({
        kind: FragmentKinds.Rectangle,
        pageNumber: 1,
        boundingBox: Object.freeze({
          position: Object.freeze({ x: 20, y: 0 }),
          width: 5,
          height: 5,
        }),
      }),
    ]);

    const reader = new PdfReader(new FakePdfEngine(fragments));
    const source = new InMemoryPdfBinarySource(
      "test.pdf",
      new Uint8Array([1, 2, 3]),
    );

    const result = await reader.readFragments(source);

    expect(result).toEqual(fragments);
  });
});
