import {
  CompositePdfEngine,
  PdfImageExtractor,
  type IReaderConfiguration,
} from "@monorepo/core-pdf-reader";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function resolveExtension(mimeType: string | undefined, fallback?: string): string {
  if (fallback) return fallback;

  switch (mimeType) {
    case "image/jpeg": return "jpg";
    case "image/png": return "png";
    case "image/jp2": return "jp2";
    case "image/tiff": return "tiff";
    default: return "bin";
  }
}

describe("core-pdf-reader consumer integration (page 1 only)", () => {
  it("should generate deterministic JSON export for page 1", async () => {
    const inputPath = join(process.cwd(), "tests", "Kiwi.pdf");
    const outputDir = join(process.cwd(), "tests", "generated");
    const imagesDir = join(outputDir, "images");

    console.log("[TEST] inputPath:", inputPath);

    const binary = new Uint8Array(await readFile(inputPath));
    console.log("[TEST] binary size:", binary.length);

    const engine = new CompositePdfEngine();

    const configuration: IReaderConfiguration = Object.freeze({
      saveReadImages: true,
    });

    const imageExtractor = new PdfImageExtractor(configuration);

    const [pageCount, pages, textFragments, imageFragments] = await Promise.all([
      engine.readPageCount(binary),
      engine.readPages(binary),
      engine.readTextFragments(binary),
      imageExtractor.readImageFragments(binary),
    ]);

    console.log("[TEST] pageCount:", pageCount);
    console.log("[TEST] pages length:", pages.length);
    console.log("[TEST] textFragments:", textFragments.length);
    console.log("[TEST] imageFragments:", imageFragments.length);

    imageFragments.forEach((img, i) => {
      console.log(`[IMG ${i}]`, {
        page: img.pageNumber,
        name: img.name,
        ext: (img as any).extension,
        mime: (img as any).mimeType,
        bytes: img.bytes?.length ?? 0,
      });
    });

    await mkdir(imagesDir, { recursive: true });

    const exportedImages = [];

    for (let i = 0; i < imageFragments.length; i++) {
      const image = imageFragments[i];

      const extension = resolveExtension(
        (image as any).mimeType,
        (image as any).extension,
      );

      const imageName = image.name ?? `image-${i + 1}`;
      const fileName = `Kiwi.page${image.pageNumber}.${imageName}.${extension}`;
      const outputPath = join(imagesDir, fileName);

      console.log(`[WRITE] ${fileName} (${image.bytes?.length ?? 0} bytes)`);

      if (image.bytes && image.bytes.length > 0) {
        await writeFile(outputPath, image.bytes);
      }

      exportedImages.push(
        Object.freeze({
          index: i + 1,
          pageNumber: image.pageNumber,
          name: image.name,
          extension,
          mimeType: (image as any).mimeType,
          boundingBox: image.boundingBox,
          byteLength: image.bytes?.length ?? 0,
          fileName,
        }),
      );
    }

    const payload = Object.freeze({
      fileName: "Kiwi.pdf",
      pageCount,
      pages,
      textFragments,
      imageCount: imageFragments.length,
      images: exportedImages,
    });

    const jsonPath = join(outputDir, "Kiwi.consumer.export.json");

    console.log("[WRITE] JSON:", jsonPath);

    await writeFile(
      jsonPath,
      JSON.stringify(payload, null, 2),
      "utf-8",
    );

    console.log("[DONE] Export complete");

    expect(pageCount).toBeGreaterThan(0);
    expect(pages.length).toBe(pageCount);
    expect(textFragments.length).toBeGreaterThan(0);
    expect(imageFragments.every(i => i.pageNumber >= 1)).toBe(true);

    expect(payload.fileName).toBe("Kiwi.pdf");
    expect(typeof payload.pageCount).toBe("number");
    expect(Array.isArray(payload.pages)).toBe(true);
    expect(Array.isArray(payload.images)).toBe(true);
  });
});