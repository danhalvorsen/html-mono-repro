// NEW diagnostic test file only:
// tests/PID/Images/PID.image-streams.diagnostic.test.ts

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument, PDFName, PDFRawStream } from "pdf-lib";
import { describe, expect, it } from "vitest";

const TestDirectory = dirname(fileURLToPath(import.meta.url));

const PdfPath = join(TestDirectory, "..", "PID.pdf");
const OutputDirectory = join(TestDirectory, "images");
const DiagnosticOutputPath = join(OutputDirectory, "PID.image-streams.json");

interface ImageStreamDiagnostic {
  readonly pageNumber: number;
  readonly name: string;
  readonly subtype: string;
  readonly filter: string;
  readonly byteLength: number;
}

describe("PID.pdf image stream diagnostics", () => {
  it("should list embedded PDF image streams and filters", async () => {
    await mkdir(OutputDirectory, { recursive: true });

    const binary = new Uint8Array(await readFile(PdfPath));
    const pdfDocument = await PDFDocument.load(binary);

    const diagnostics: ImageStreamDiagnostic[] = [];

    for (let pageIndex = 0; pageIndex < pdfDocument.getPageCount(); pageIndex += 1) {
      const page = pdfDocument.getPage(pageIndex);
      const resources = page.node.Resources();

      if (resources === undefined) {
        continue;
      }

      const xObjectRef = resources.get(PDFName.of("XObject"));

      if (xObjectRef === undefined) {
        continue;
      }

      const xObjectDictionary = pdfDocument.context.lookup(xObjectRef) as unknown as {
        entries(): Iterable<[unknown, unknown]>;
        lookup(key: unknown): unknown;
      };

      for (const [nameKey] of xObjectDictionary.entries()) {
        const object = xObjectDictionary.lookup(nameKey);

        if (!(object instanceof PDFRawStream)) {
          continue;
        }

        const subtype = String(object.dict.get(PDFName.of("Subtype")));
        const filter = String(object.dict.get(PDFName.of("Filter")));

        if (subtype !== "/Image") {
          continue;
        }

        diagnostics.push({
          pageNumber: pageIndex + 1,
          name: String(nameKey).replace(/^\//, ""),
          subtype,
          filter,
          byteLength: object.getContents().length,
        });
      }
    }

    await writeFile(
      DiagnosticOutputPath,
      `${JSON.stringify(diagnostics, null, 2)}\n`,
    );

    expect(Array.isArray(diagnostics)).toBe(true);
  });
});