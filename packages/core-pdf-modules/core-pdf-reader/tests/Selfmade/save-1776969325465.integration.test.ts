import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { FragmentKinds, type IPdfFragment } from "@monorepo/core-pdf-domain";
import { describe, expect, it } from "vitest";

import type { IPdfReader } from "../../src/IPdfReader.js";
import { CompositePdfEngine } from "../../src/engine/CompositePdfEngine.js";
import { PdfFragmentJsonSerializer } from "../../src/engine/PdfFragmentJsonSerializer.js";
import { PdfReader } from "../../src/services/PdfReader.js";
import { InMemoryPdfBinarySource } from "../../src/sources/InMemoryPdfBinarySource.js";

function countByKind(fragments: readonly IPdfFragment[]): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};

  for (const fragment of fragments) {
    counts[fragment.kind] = (counts[fragment.kind] ?? 0) + 1;
  }

  return Object.freeze(counts);
}

describe("CompositePdfEngine (Selfmade) integration", () => {
  it("save-1776969325465.pdf: IPdfReader.readFragments returns expected IPdfFragment types and total", async () => {
    const reader: IPdfReader = new PdfReader(new CompositePdfEngine());
    const thisDirectory = dirname(fileURLToPath(import.meta.url));
    const binary = new Uint8Array(
      await readFile(join(thisDirectory, "save-1776969325465.pdf")),
    );
    const source = new InMemoryPdfBinarySource("save-1776969325465.pdf", binary);

    const fragments = await reader.readFragments(source);
    const kinds = countByKind(fragments);

    expect(fragments.length).toBe(5);
    expect(kinds[FragmentKinds.Text] ?? 0).toBe(3);
    expect(kinds[FragmentKinds.Rectangle] ?? 0).toBe(2);
    expect(Object.keys(kinds).sort()).toEqual([
      FragmentKinds.Rectangle,
      FragmentKinds.Text,
    ]);
  });

  it("save-1776969325465.pdf: PdfFragmentJsonSerializer returns normalized fragments", async () => {
    const engine = new CompositePdfEngine();
    const serializer = new PdfFragmentJsonSerializer();
    const thisDirectory = dirname(fileURLToPath(import.meta.url));
    const binary = new Uint8Array(
      await readFile(join(thisDirectory, "save-1776969325465.pdf")),
    );
    const fragments = await engine.readFragments(binary);
    const payloadBytes = serializer.serialize(engine.name, fragments);
    const parsed = JSON.parse(new TextDecoder().decode(payloadBytes)) as {
      totals?: { fragments?: number };
      fragments?: Array<{
        id?: string;
        kind?: string;
        pageNumber?: number;
      }>;
    };

    expect(parsed.totals?.fragments).toBe(5);
    expect(Array.isArray(parsed.fragments)).toBe(true);
    expect(parsed.fragments?.length).toBe(5);
    expect(
      (parsed.fragments ?? []).every((fragment) =>
        typeof fragment.id === "string"
        && typeof fragment.pageNumber === "number"
        && typeof fragment.kind === "string"
        && !("internalDistances" in fragment)
      ),
    ).toBe(true);
  });
});
