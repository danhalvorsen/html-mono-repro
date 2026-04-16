import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, PDFName, PDFRawStream } from "pdf-lib";
import { describe, expect, it } from "vitest";

interface IExtractedImageFile {
  readonly name: string;
  readonly extension: string;
  readonly bytes: Uint8Array;
}

function detectImageExtension(filterValue: unknown): string {
  const normalized = String(filterValue);

  if (normalized.includes("/DCTDecode")) {
    return "jpg";
  }

  if (normalized.includes("/JPXDecode")) {
    return "jp2";
  }

  if (normalized.includes("/FlateDecode")) {
    return "bin";
  }

  if (normalized.includes("/LZWDecode")) {
    return "bin";
  }

  if (normalized.includes("/CCITTFaxDecode")) {
    return "tiff";
  }

  return "bin";
}

async function extractFirstPageImageStreams(binary: Uint8Array): Promise<readonly IExtractedImageFile[]> {
  const pdfDocument = await PDFDocument.load(binary);
  const firstPage = pdfDocument.getPage(0);
  const resources = firstPage.node.Resources();

  if (resources === undefined) {
    return Object.freeze([]);
  }

  const xObjectRef = resources.get(PDFName.of("XObject"));
  if (xObjectRef === undefined) {
    return Object.freeze([]);
  }

  const xObjectDictionary = pdfDocument.context.lookup(xObjectRef) as {
    entries(): Iterable<[unknown, unknown]>;
    lookup(key: unknown): unknown;
  };

  const files: IExtractedImageFile[] = [];

  for (const [nameKey] of xObjectDictionary.entries()) {
    const object = xObjectDictionary.lookup(nameKey);
    if (!(object instanceof PDFRawStream)) {
      continue;
    }

    const subtype = object.dict.get(PDFName.of("Subtype"));
    if (String(subtype) !== "/Image") {
      continue;
    }

    const filterValue = object.dict.get(PDFName.of("Filter"));
    const extension = detectImageExtension(filterValue);
    const imageName = String(nameKey).replace(/^\//, "");

    files.push(
      Object.freeze({
        name: imageName,
        extension,
        bytes: object.getContents(),
      }),
    );
  }

  return Object.freeze(files);
}

describe("Pdf image file export (Kiwi.pdf) - page 1", () => {
  it("should save first-page images into tests/images-loading/images", async () => {
    const inputPath = join(process.cwd(), "tests", "Kiwi.pdf");
    const outputDir = join(process.cwd(), "tests", "images-loading", "images");

    const binary = new Uint8Array(await readFile(inputPath));
    const images = await extractFirstPageImageStreams(binary);

    await mkdir(outputDir, { recursive: true });

    for (const image of images) {
      const outputPath = join(outputDir, `Kiwi.page1.${image.name}.${image.extension}`);
      await writeFile(outputPath, image.bytes);
    }

    expect(images.length).toBeGreaterThan(0);
    expect(images.every((image) => image.bytes.length > 0)).toBe(true);
  });
});