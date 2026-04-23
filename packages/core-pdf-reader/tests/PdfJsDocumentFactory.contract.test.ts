
import { describe, expect, it, vi } from "vitest";
import { PdfJsTestFixture } from "./fixtures/pdfjs-fixture.js";
import {
  IPdfJsDocumentProxy,
  PdfJsDocumentFactory,
} from "../src/engine/PdfJsDocumentFactory.js";
 
vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => {
  return {
    default: {},
    getDocument: vi.fn(),
  };
});

describe("PdfJsDocumentFactory", () => {
  const fixture = new PdfJsTestFixture();

  it("should open binary through pdfjs and return document adapter", async () => {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const proxy: IPdfJsDocumentProxy = fixture.createDocumentProxy({ numPages: 4 });

    vi.mocked(pdfjs.getDocument).mockReturnValue({
      promise: Promise.resolve(proxy),
    } as unknown as ReturnType<typeof pdfjs.getDocument>);

    const sut = new PdfJsDocumentFactory();
    const binary = new Uint8Array([1, 2, 3]);

    const document = await sut.open(binary);

    expect(pdfjs.getDocument).toHaveBeenCalledOnce();
    expect(pdfjs.getDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.any(Uint8Array),
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: false,
        isOffscreenCanvasSupported: false,
        isImageDecoderSupported: false,
      }),
    );
    const calledWith = vi.mocked(pdfjs.getDocument).mock.calls[0]?.[0] as {
      data: Uint8Array;
    };
    expect(calledWith.data).toEqual(binary);
    expect(calledWith.data).not.toBe(binary);
    expect(document.pageCount).toBe(4);
  });
});
