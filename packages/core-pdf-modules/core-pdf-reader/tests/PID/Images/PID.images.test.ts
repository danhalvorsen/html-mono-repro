// New test file only.
// Example path: packages/core-pdf-reader/tests/integration/PdfImageExtractor.integration.test.ts

import { PdfImageExtractor } from "../../../src/engine/PdfImageExtractor.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const TestDirectory = dirname(fileURLToPath(import.meta.url));

const PdfPath = join(TestDirectory, "..", "PID.pdf");
const OutputDirectory = join(TestDirectory, "images");

const ImageExtensions = Object.freeze({
  "image/jpeg": "jpg",
  "image/jp2": "jp2",
} as const);

type SupportedMimeType = keyof typeof ImageExtensions;

function isSupportedMimeType(
  value: string | undefined,
): value is SupportedMimeType {
  return value === "image/jpeg" || value === "image/jp2";
}

describe("KISS: extract all images from PID.pdf", () => {
  it("should extract and save supported images from PID.pdf", async () => {
    await mkdir(OutputDirectory, { recursive: true });

    const binary = new Uint8Array(await readFile(PdfPath));
    const extractor = new PdfImageExtractor({ saveReadImages: true });

    const images = await extractor.readImageFragments(binary);

    expect(images.length).toBeGreaterThan(0);

    let savedCount = 0;

    for (const image of images) {
      expect(image.pageNumber).toBeGreaterThan(0);
      expect(image.name).toBeDefined();
      expect(image.bytes).toBeDefined();
      expect(image.bytes?.length).toBeGreaterThan(0);

      if (!isSupportedMimeType(image.mimeType)) {
        continue;
      }

      const outputPath = join(
        OutputDirectory,
        `page${image.pageNumber}_${image.name}.${
          ImageExtensions[image.mimeType]
        }`,
      );

      const bytes = image.bytes;

      if (bytes === undefined) {
        throw new Error(`Image '${image.name ?? "<unnamed>"}' has no bytes.`);
      }

      await writeFile(outputPath, bytes);
      savedCount += 1;
    }

    expect(savedCount).toBeGreaterThan(0);
  });
});
