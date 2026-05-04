import { describe, expect, it } from "vitest";
import { PdfReaderFixture } from "./pdf-reader.fixture.js";
import { mkdir, writeFile } from "fs/promises";

describe("Kiwi.pdf image extraction integration", () => {
  it("should export image metadata JSON with bounding boxes", async () => {
    const fixture = new PdfReaderFixture(process.cwd());
    const binary = await fixture.readBinary();

    const images = await fixture.imageExtractor.readImageFragments(binary);

    const payload = Object.freeze({
      sourcePdf: "Kiwi.pdf",
      generatedAtUtc: new Date().toISOString(),
      imageCount: images.length,
      images: Object.freeze(
        images.map((image, index) =>
          Object.freeze({
            id: `image-${index}`,
            pageNumber: image.pageNumber,
            name: image.name ?? null,
            mimeType: image.mimeType ?? null,
            boundingBox: Object.freeze({
              position: Object.freeze({
                x: image.boundingBox.position.x,
                y: image.boundingBox.position.y,
              }),
              width: image.boundingBox.width,
              height: image.boundingBox.height,
            }),
          }),
        ),
      ),
    });

    await mkdir(fixture.imagesRootDirectory, { recursive: true });
    await writeFile(
      fixture.imagesJsonPath,
      JSON.stringify(payload, null, 2),
      "utf-8",
    );

    expect(images.length).toBeGreaterThan(0);
  });
});