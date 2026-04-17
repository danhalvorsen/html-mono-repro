import { PdfImageExtractor } from "../../src/old/engine/PdfImageExtractor.js";
import { CompositePdfEngine, IReaderConfiguration } from "../../src/old/index.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
 
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function resolveExtension(mimeType: string | undefined): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/jp2":
      return "jp2";
    case "image/tiff":
      return "tiff";
    default:
      return "bin";
  }
}

describe("core-pdf-reader consumer integration", () => {
  it("should consume the public abstraction and export text and images from Kiwi.pdf", async () => {
    const inputPath = join(process.cwd(), "tests", "Kiwi.pdf");
    const outputDir = join(process.cwd(), "tests", "images-loading", "consumer-output");
    const imagesDir = join(outputDir, "images");

    const binary = new Uint8Array(await readFile(inputPath));

    const engine = new CompositePdfEngine();
    const configuration: IReaderConfiguration = Object.freeze({
      saveReadImages: true,
    });
    const imageExtractor = new PdfImageExtractor(configuration);

    const pageCount = await engine.readPageCount(binary);
    const pages = await engine.readPages(binary);
    const textFragments = await engine.readTextFragments(binary);
    const imageFragments = await imageExtractor.readImageFragments(binary);

    await mkdir(imagesDir, { recursive: true });

    const exportedImages = [];

    for (let index = 0; index < imageFragments.length; index++) {
      const image = imageFragments[index];
      const extension = resolveExtension(image.mimeType);
      const imageName = image.name ?? `image-${index + 1}`;
      const fileName = `Kiwi.page${image.pageNumber}.${imageName}.${extension}`;
      const outputPath = join(imagesDir, fileName);

      if (image.bytes !== undefined && image.bytes.length > 0) {
        await writeFile(outputPath, image.bytes);
      }

      exportedImages.push(
        Object.freeze({
          index: index + 1,
          pageNumber: image.pageNumber,
          name: image.name,
          mimeType: image.mimeType,
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

    await writeFile(
      join(outputDir, "Kiwi.consumer.export.json"),
      JSON.stringify(payload, null, 2),
      "utf-8",
    );

    expect(pageCount).toBeGreaterThan(0);
    expect(pages.length).toBe(pageCount);
    expect(textFragments.length).toBeGreaterThan(0);
    expect(Array.isArray(imageFragments)).toBe(true);
    expect(imageFragments.every((image) => image.pageNumber >= 1)).toBe(true);
  });
});
