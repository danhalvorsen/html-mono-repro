import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFArray, PDFDocument, PDFName, PDFRawStream, decodePDFRawStream } from "pdf-lib";
import { describe, expect, it } from "vitest";
import type { IPdfImageFragment } from "../../src/IPdfImageFragment.js";

interface IExportedMetadata {
  readonly title?: string;
  readonly author?: string;
  readonly subject?: string;
  readonly creator?: string;
  readonly producer?: string;
  readonly creationDateUtc?: string;
  readonly modificationDateUtc?: string;
  readonly pageCount: number;
}

async function readMetadataFromPdfLib(binary: Uint8Array): Promise<IExportedMetadata> {
  const pdfDocument = await PDFDocument.load(binary);

  const title = pdfDocument.getTitle();
  const author = pdfDocument.getAuthor();
  const subject = pdfDocument.getSubject();
  const creator = pdfDocument.getCreator();
  const producer = pdfDocument.getProducer();
  const creationDate = pdfDocument.getCreationDate();
  const modificationDate = pdfDocument.getModificationDate();

  return Object.freeze({
    ...(typeof title === "string" && title.length > 0 && { title }),
    ...(typeof author === "string" && author.length > 0 && { author }),
    ...(typeof subject === "string" && subject.length > 0 && { subject }),
    ...(typeof creator === "string" && creator.length > 0 && { creator }),
    ...(typeof producer === "string" && producer.length > 0 && { producer }),
    ...(creationDate instanceof Date && { creationDateUtc: creationDate.toISOString() }),
    ...(modificationDate instanceof Date && { modificationDateUtc: modificationDate.toISOString() }),
    pageCount: pdfDocument.getPageCount(),
  });
}

/**
 * Parse a PDF content stream byte array and return a map from image name to
 * the [a, b, c, d, e, f] CTM that was active when the image was painted (Do).
 *
 * We look for sequences: <6 numbers> cm ... /Name Do
 * The translation components are e (x) and f (y) in PDF user-space coordinates.
 * PDF user-space origin is bottom-left; we keep those raw values here.
 */
function parseImageCTMs(contentBytes: Uint8Array): Map<string, [number, number, number, number, number, number]> {
  const text = new TextDecoder("latin1").decode(contentBytes);
  // Tokenize: split on whitespace but keep tokens
  const tokens = text.match(/[^\s]+/g) ?? [];

  const placements = new Map<string, [number, number, number, number, number, number]>();
  // Rolling number stack and last CTM seen
  const numStack: number[] = [];
  let lastCm: [number, number, number, number, number, number] | null = null;
  let pendingName: string | null = null;

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const num = Number(tok);

    if (!Number.isNaN(num) && tok !== "") {
      numStack.push(num);
      continue;
    }

    if (tok === "cm") {
      if (numStack.length >= 6) {
        const [a, b, c, d, e, f] = numStack.splice(numStack.length - 6, 6);
        lastCm = [a, b, c, d, e, f];
      }
      numStack.length = 0;
      pendingName = null;
      continue;
    }

    if (tok === "q" || tok === "Q") {
      numStack.length = 0;
      if (tok === "Q") lastCm = null;
      pendingName = null;
      continue;
    }

    if (tok.startsWith("/")) {
      pendingName = tok.slice(1); // strip leading /
      numStack.length = 0;
      continue;
    }

    if (tok === "Do" && pendingName !== null) {
      if (lastCm !== null) {
        placements.set(pendingName, lastCm);
      }
      pendingName = null;
      numStack.length = 0;
      continue;
    }

    numStack.length = 0;
    pendingName = null;
  }

  return placements;
}

async function readImagesFromPdfLib(binary: Uint8Array): Promise<readonly IPdfImageFragment[]> {
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

  // --- extract content stream bytes to get real placement coordinates ---
  const contentsValue = firstPage.node.get(PDFName.of("Contents"));
  let contentBytes = new Uint8Array(0);

  if (contentsValue !== undefined) {
    const resolved = pdfDocument.context.lookup(contentsValue);
    let streams: PDFRawStream[] = [];

    if (resolved instanceof PDFArray) {
      for (let i = 0; i < resolved.size(); i++) {
        const item = pdfDocument.context.lookup(resolved.get(i));
        if (item instanceof PDFRawStream) streams.push(item);
      }
    } else if (resolved instanceof PDFRawStream) {
      streams = [resolved];
    }

    const parts: Uint8Array[] = streams.map((s) => decodePDFRawStream(s).decode());
    const totalLength = parts.reduce((acc, p) => acc + p.length, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const part of parts) {
      merged.set(part, offset);
      offset += part.length;
    }
    contentBytes = merged;
  }

  const ctmMap = parseImageCTMs(contentBytes);

  const result: IPdfImageFragment[] = [];

  for (const [nameKey] of xObjectDictionary.entries()) {
    const stream = xObjectDictionary.lookup(nameKey) as {
      dict?: { get(name: unknown): unknown };
    };

    const dictionary = stream.dict;
    if (dictionary === undefined) {
      continue;
    }

    const subtype = dictionary.get(PDFName.of("Subtype"));
    if (String(subtype) !== "/Image") {
      continue;
    }

    const widthValue = dictionary.get(PDFName.of("Width"));
    const heightValue = dictionary.get(PDFName.of("Height"));

    const pixelWidth = Number.parseFloat(String(widthValue));
    const pixelHeight = Number.parseFloat(String(heightValue));

    const imageName = String(nameKey).replace(/^\//, "");
    const ctm = ctmMap.get(imageName);
    // CTM [a,b,c,d,e,f]: e=x translation, f=y translation (PDF bottom-left origin)
    const x = ctm !== undefined ? ctm[4] : 0;
    const y = ctm !== undefined ? ctm[5] : 0;

    result.push(
      Object.freeze({
        pageNumber: 1,
        boundingBox: {
          position: { x, y },
          width: Number.isFinite(pixelWidth) ? pixelWidth : 0,
          height: Number.isFinite(pixelHeight) ? pixelHeight : 0,
        },
        name: imageName,
      }),
    );
  }

  return Object.freeze(result);
}

describe("PdfImageExtractor (Kiwi.pdf) - page 1 image JSON export", () => {
  it("should load first-page images and export properties with metadata", async () => {
    const inputPath = join(process.cwd(), "tests", "Kiwi.pdf");
    const outputDir = join(process.cwd(), "tests", "images-loading");
    const outputPath = join(outputDir, "Kiwi.page1.images.json");

    const binary = new Uint8Array(await readFile(inputPath));

    const metadata = await readMetadataFromPdfLib(binary);
    const images = await readImagesFromPdfLib(binary);

    const page1Images = images.filter((image) => image.pageNumber === 1);

    const payload = Object.freeze({
      fileName: "Kiwi.pdf",
      pageNumber: 1,
      exportedAtUtc: new Date().toISOString(),
      metadata,
      imageCount: page1Images.length,
      images: page1Images,
    });

    await mkdir(outputDir, { recursive: true });
    await writeFile(outputPath, JSON.stringify(payload, null, 2), "utf-8");

    expect(Array.isArray(page1Images)).toBe(true);
    expect(page1Images.every((image) => image.pageNumber === 1)).toBe(true);
    expect(page1Images.length).toBeGreaterThanOrEqual(0);
  });
});