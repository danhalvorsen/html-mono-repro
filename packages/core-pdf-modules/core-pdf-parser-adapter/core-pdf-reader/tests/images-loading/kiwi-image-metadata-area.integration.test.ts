// packages/core-pdf-reader/tests/images-loading/kiwi-image-metadata-area.integration.test.ts

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  PdfEngine,
  type IReaderConfiguration,
} from "../../src/index.js";
import { PdfImageExtractor } from "../../src/engine/PdfImageExtractor.js";

describe("Kiwi.pdf image metadata consistency", () => {
  it("should prove page 1 image fragments currently have zero-area bounding boxes", async () => {
    const inputPath = join(process.cwd(), "tests", "Kiwi.pdf");
    const binary = new Uint8Array(await readFile(inputPath));

    const engine = new PdfEngine();

    const configuration: IReaderConfiguration = Object.freeze({
      saveReadImages: true,
    });

    const extractor = new PdfImageExtractor(configuration);

    const [textFragments, imageFragments] = await Promise.all([
      engine.readTextFragments(binary),
      extractor.readImageFragments(binary),
    ]);

    const page1TextFragments = textFragments.filter(
      (fragment) => fragment.pageNumber === 1,
    );

    const page1ImageFragments = imageFragments.filter(
      (image) => image.pageNumber === 1,
    );

    expect(page1TextFragments.length).toBeGreaterThan(0);
    expect(page1ImageFragments.length).toBeGreaterThan(0);

    const page1TextHasArea = page1TextFragments.some(
      (fragment) =>
        fragment.boundingBox.width > 0 &&
        fragment.boundingBox.height > 0,
    );

    const page1ImageAreas = page1ImageFragments.map(
      (image) => image.boundingBox.width * image.boundingBox.height,
    );

    const allPage1ImageAreasAreZero = page1ImageAreas.every(
      (area) => area === 0,
    );

    expect(page1TextHasArea).toBe(true);
    expect(allPage1ImageAreasAreZero).toBe(true);
  });
});
