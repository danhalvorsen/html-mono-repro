// packages/core-pdf-web-app-demo/pdf-reading/tests/create-data-code/pdf-reader.integration.test.ts

import { mkdir, writeFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { PdfReaderFixture } from "./pdf-reader.fixture.js";

interface IExportedFragment {
  readonly pageNumber: number;
  readonly text: string;
  readonly boundingBox: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
}

describe("PdfReaderFixture", () => {
  it("should extract text fragments from Kiwi.pdf and write JSON", async () => {
    const fixture = new PdfReaderFixture(process.cwd());
    const binary = await fixture.readBinary();

    const fragments = await fixture.engine.readTextFragments(binary);

    const payload = Object.freeze({
      sourcePdf: "Kiwi.pdf",
      generatedAtUtc: new Date().toISOString(),
      fragmentCount: fragments.length,
      fragments: Object.freeze(
        fragments.map<IExportedFragment>((fragment): Readonly<{ pageNumber: number; text: string; boundingBox: Readonly<{ x: any; y: any; width: any; height: any; }>; }> =>
          Object.freeze({
            pageNumber: fragment.pageNumber,
            text: fragment.text,
            boundingBox: Object.freeze({
              x: fragment.boundingBox.position.x,
              y: fragment.boundingBox.position.y,
              width: fragment.boundingBox.width,
              height: fragment.boundingBox.height,
            }),
          }),
        ),
      ),
    });

    await mkdir(fixture.outputDirectory, { recursive: true });
    await writeFile(
      fixture.fragmentsJsonPath,
      JSON.stringify(payload, null, 2),
      "utf-8",
    );

    expect(fragments.length).toBeGreaterThan(0);
    expect(fragments.some((fragment) => fragment.text.trim().length > 0)).toBe(true);
  });
});