
// packages/core-pdf-reader/tests/engine/PdfJsDocument.test.ts

import { describe, expect, it } from "vitest";

import { PdfJsDocument } from "../src/old/engine/PdfJsDocument.js";
import { PdfJsPage } from "../src/old/engine/PdfJsPage.js";
import { PdfJsTestFixture } from "./fixtures/pdfjs-fixture.js";

describe("PdfJsDocument", () => {
  const fixture = new PdfJsTestFixture();

  it("should expose page count from wrapped pdfjs document", () => {
    const proxy = fixture.createDocumentProxy({ numPages: 3 });

    const sut = new PdfJsDocument(proxy);

    expect(sut.pageCount).toBe(3);
  });

  it("should map metadata fields from wrapped pdfjs document", async () => {
    const proxy = fixture.createDocumentProxy({
      metadataInfo: {
        Title: "Kiwi",
        Author: "Dan",
        Subject: "Prices",
        Creator: "pdfjs",
        Producer: "test",
        CreationDate: "20260101",
        ModDate: "20260102",
      },
    });

    const sut = new PdfJsDocument(proxy);
    const result = await sut.readMetadata();

    expect(result).toEqual({
      title: "Kiwi",
      author: "Dan",
      subject: "Prices",
      creator: "pdfjs",
      producer: "test",
      creationDateUtc: "20260101",
      modificationDateUtc: "20260102",
    });
  });

  it("should return wrapped page adapter when requested page number is valid", async () => {
    const proxy = fixture.createDocumentProxy({
      numPages: 2,
      pages: new Map([
        [1, fixture.createPageProxy({ pageNumber: 1 })],
        [2, fixture.createPageProxy({ pageNumber: 2 })],
      ]),
    });

    const sut = new PdfJsDocument(proxy);
    const page = await sut.getPage(2);

    expect(page).toBeInstanceOf(PdfJsPage);
    expect(page.pageNumber).toBe(2);
  });

  it("should throw when requested page number is lower than one", async () => {
    const proxy = fixture.createDocumentProxy({ numPages: 2 });

    const sut = new PdfJsDocument(proxy);

    await expect(sut.getPage(0)).rejects.toThrowError(
      "Invalid PDF page number '0'.",
    );
  });

  it("should throw when requested page number is greater than page count", async () => {
    const proxy = fixture.createDocumentProxy({ numPages: 2 });

    const sut = new PdfJsDocument(proxy);

    await expect(sut.getPage(3)).rejects.toThrowError(
      "Invalid PDF page number '3'.",
    );
  });
});

