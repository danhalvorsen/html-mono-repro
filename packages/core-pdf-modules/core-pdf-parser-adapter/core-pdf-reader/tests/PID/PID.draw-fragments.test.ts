// NEW TEST FILE ONLY
// packages/core-pdf-reader/tests/PID/Images/PID.draw-fragments.test.ts

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { FragmentKinds, type PdfFragment } from "@monorepo/core-pdf-domain";
import { PDFDocument, rgb } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { PdfEngine } from "../../src/engine/PdfEngine.js";

const TestDirectory = dirname(fileURLToPath(import.meta.url));

const PdfPath = join(TestDirectory, "PID.pdf");
const OutputDirectory = join(TestDirectory, "Images", "images");
const OutputPdfPath = join(OutputDirectory, "PID.with-image-fragments.pdf");
const FragmentStrokeWidth = 0.35;

const FragmentStrokeColors = Object.freeze({
  [FragmentKinds.Text]: rgb(0, 0, 1),
  [FragmentKinds.Rectangle]: rgb(1, 0, 0),
  [FragmentKinds.Image]: rgb(0, 0.6, 0),
  [FragmentKinds.Path]: rgb(1, 0.6, 0),
} as const);

describe("KISS: draw all PDF fragments on PID.pdf", () => {
  it("should create a PDF with fragment bounding boxes", async () => {
    await mkdir(OutputDirectory, { recursive: true });

    const binary = new Uint8Array(await readFile(PdfPath));

    const engine = new PdfEngine();
    const fragments = await engine.readFragments(binary);

    expect(fragments.length).toBeGreaterThan(0);

    const pdfDocument = await PDFDocument.load(binary);
    const pages = pdfDocument.getPages();

    for (const fragment of fragments) {
      const page = pages[fragment.pageNumber - 1];

      if (page === undefined) {
        throw new Error(`Page '${fragment.pageNumber}' was not found.`);
      }

      drawFragment(page, fragment);
    }

    const output = await pdfDocument.save();
    await writeFile(OutputPdfPath, output);

    expect(output.length).toBeGreaterThan(0);
  });
});

function drawFragment(
  page: ReturnType<PDFDocument["getPages"]>[number],
  fragment: PdfFragment,
): void {
  const { position, width, height } = fragment.boundingBox;

  if (width <= 0 || height <= 0) {
    return;
  }

  const pageHeight = page.getHeight();

  page.drawRectangle({
    x: position.x,
    y: pageHeight - position.y - height,
    width,
    height,
    borderColor: FragmentStrokeColors[fragment.kind],
    borderWidth: FragmentStrokeWidth,
  });
}