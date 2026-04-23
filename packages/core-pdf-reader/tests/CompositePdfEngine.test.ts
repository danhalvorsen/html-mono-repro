import { describe, expect, it, vi } from "vitest";
import { PdfJsTestFixture } from "./fixtures/pdfjs-fixture.js";
import { CompositePdfEngine } from "../src/engine/CompositePdfEngine.js";

vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => {
  return {
    default: {},
    getDocument: vi.fn(),
  };
});

describe("CompositePdfEngine", () => {
  const fixture = new PdfJsTestFixture();

  it("should expose font metadata when pdfjs text content provides it", async () => {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const page = fixture.createPageProxy({
      pageNumber: 1,
      styles: {
        g_d0_f9: { fontFamily: "Helvetica Neue" },
      },
      items: [
        fixture.createTextItem({
          str: "Kiwi",
          fontName: "g_d0_f9",
          transform: [1, 0, 0, 18, 25, 40],
          width: 36,
          height: 20,
        }),
      ],
    });

    const proxy = fixture.createDocumentProxy({
      numPages: 1,
      pages: new Map([[1, page]]),
    });

    vi.mocked(pdfjs.getDocument).mockReturnValue({
      promise: Promise.resolve(proxy),
    } as unknown as ReturnType<typeof pdfjs.getDocument>);

    const sut = new CompositePdfEngine();
    const binary = new Uint8Array([1, 2, 3]);

    const fragments = await sut.readTextFragments(binary);

    expect(fragments).toEqual([
      {
        pageNumber: 1,
        rawText: "Kiwi",
        text: "Kiwi",
        textType: "text",
        textSize: 18,
        boundingBox: {
          position: { x: 25, y: 40 },
          width: 36,
          height: 20,
        },
        font: {
          name: "Helvetica Neue",
          size: 18,
          family: "Helvetica Neue",
          rawName: "g_d0_f9",
        },
        fontName: "g_d0_f9",
        fontFamily: "Helvetica Neue",
        fontSize: 18,
      },
    ]);
  });

  it("should expose font metadata from fontInformation object", async () => {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const page = fixture.createPageProxy({
      pageNumber: 1,
      styles: {
        g_d0_f7: { fontFamily: "Roboto" },
      },
      items: [
        fixture.createTextItem({
          str: "FontObject",
          fontInformation: {
            name: "Roboto",
            size: 11,
            family: "Roboto",
            rawName: "g_d0_f7",
          },
          transform: [1, 0, 0, 11, 14, 22],
          width: 55,
          height: 0,
        }),
      ],
    });

    const proxy = fixture.createDocumentProxy({
      numPages: 1,
      pages: new Map([[1, page]]),
    });

    vi.mocked(pdfjs.getDocument).mockReturnValue({
      promise: Promise.resolve(proxy),
    } as unknown as ReturnType<typeof pdfjs.getDocument>);

    const sut = new CompositePdfEngine();
    const binary = new Uint8Array([9, 8, 7]);

    const fragments = await sut.readTextFragments(binary);

    expect(fragments).toEqual([
      {
        pageNumber: 1,
        rawText: "FontObject",
        text: "FontObject",
        textType: "text",
        textSize: 11,
        boundingBox: {
          position: { x: 14, y: 22 },
          width: 55,
          height: 11,
        },
        font: {
          name: "Roboto",
          size: 11,
          family: "Roboto",
          rawName: "g_d0_f7",
        },
        fontName: "g_d0_f7",
        fontFamily: "Roboto",
        fontSize: 11,
      },
    ]);
  });
});
