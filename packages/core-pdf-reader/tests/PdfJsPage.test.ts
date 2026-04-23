import { describe, expect, it } from "vitest";
import { PdfJsTestFixture } from "./fixtures/pdfjs-fixture.js";
import { PdfJsPage } from "../src/engine/PdfJsPage.js";

describe("PdfJsPage", () => {
  const fixture = new PdfJsTestFixture();

  it("should expose page number from wrapped pdfjs page", () => {
    const proxy = fixture.createPageProxy({ pageNumber: 7 });

    const sut = new PdfJsPage(proxy);

    expect(sut.pageNumber).toBe(7);
  });

  it("should read text fragments from valid text items only", async () => {
    const proxy = fixture.createPageProxy({
      pageNumber: 1,
      styles: {
        g_d0_f1: { fontFamily: "Helvetica" },
      },
      items: [
        fixture.createTextItem({
          str: "Milk",
          fontName: "g_d0_f1",
          transform: [1, 0, 0, 1, 10, 100],
          width: 30,
          height: 12,
        }),
        fixture.createTextItem({
          str: "  19,90  ",
          transform: [1, 0, 0, 1, 60, 100],
          width: 20,
          height: 12,
        }),
        { invalid: true },
        fixture.createTextItem({
          str: "    ",
          transform: [1, 0, 0, 1, 90, 100],
          width: 10,
          height: 12,
        }),
      ],
    });

    const sut = new PdfJsPage(proxy);
    const result = await sut.readTextFragments();

    expect(result).toEqual([
      {
        pageNumber: 1,
        rawText: "Milk",
        text: "Milk",
        textType: "text",
        textSize: 1,
        boundingBox: {
          position: { x: 10, y: 100 },
          width: 30,
          height: 12,
        },
        font: {
          name: "Helvetica",
          size: 1,
          family: "Helvetica",
          rawName: "g_d0_f1",
        },
        fontName: "g_d0_f1",
        fontFamily: "Helvetica",
        fontSize: 1,
      },
      {
        pageNumber: 1,
        rawText: "  19,90  ",
        text: "19,90",
        textType: "text",
        textSize: 1,
        boundingBox: {
          position: { x: 60, y: 100 },
          width: 20,
          height: 12,
        },
        font: {
          name: "unknown",
          size: 1,
        },
        fontSize: 1,
      },
    ]);
  });

  it("should derive fragment height from transform when explicit height is missing", async () => {
    const proxy = fixture.createPageProxy({
      pageNumber: 1,
      items: [
        fixture.createTextItem({
          str: "Derived",
          transform: [1, 0, 0, 1.5, 10, 20],
          width: 15,
          height: 0,
        }),
      ],
    });

    const sut = new PdfJsPage(proxy);
    const [fragment] = await sut.readTextFragments();

    expect(fragment).toEqual({
      pageNumber: 1,
      rawText: "Derived",
      text: "Derived",
      textType: "text",
      textSize: 1.5,
      boundingBox: {
        position: { x: 10, y: 20 },
        width: 15,
        height: 1.5,
      },
      font: {
        name: "unknown",
        size: 1.5,
      },
      fontSize: 1.5,
    });
  });

  it("should expose font metadata when pdfjs text content provides it", async () => {
    const proxy = fixture.createPageProxy({
      pageNumber: 3,
      styles: {
        g_d0_f2: { fontFamily: "Arial" },
      },
      items: [
        fixture.createTextItem({
          str: "Offer",
          fontName: "g_d0_f2",
          transform: [1, 0, 0, 14, 25, 50],
          width: 40,
          height: 0,
        }),
      ],
    });

    const sut = new PdfJsPage(proxy);
    const [fragment] = await sut.readTextFragments();

    expect(fragment).toEqual({
      pageNumber: 3,
      rawText: "Offer",
      text: "Offer",
      textType: "text",
      textSize: 14,
      boundingBox: {
        position: { x: 25, y: 50 },
        width: 40,
        height: 14,
      },
      font: {
        name: "Arial",
        size: 14,
        family: "Arial",
        rawName: "g_d0_f2",
      },
      fontName: "g_d0_f2",
      fontFamily: "Arial",
      fontSize: 14,
    });
  });

  it("should read font metadata from fontInformation object", async () => {
    const proxy = fixture.createPageProxy({
      pageNumber: 4,
      styles: {
        g_d0_f3: { fontFamily: "Fira Sans" },
      },
      items: [
        fixture.createTextItem({
          str: "ObjectFont",
          fontInformation: {
            name: "Fira Sans",
            size: 16,
            family: "Fira Sans",
            rawName: "g_d0_f3",
          },
          transform: [1, 0, 0, 16, 30, 80],
          width: 70,
          height: 0,
        }),
      ],
    });

    const sut = new PdfJsPage(proxy);
    const [fragment] = await sut.readTextFragments();

    expect(fragment).toEqual({
      pageNumber: 4,
      rawText: "ObjectFont",
      text: "ObjectFont",
      textType: "text",
      textSize: 16,
      boundingBox: {
        position: { x: 30, y: 80 },
        width: 70,
        height: 16,
      },
      font: {
        name: "Fira Sans",
        size: 16,
        family: "Fira Sans",
        rawName: "g_d0_f3",
      },
      fontName: "g_d0_f3",
      fontFamily: "Fira Sans",
      fontSize: 16,
    });
  });

  it("should apply viewport scale to width and translated coordinates", async () => {
    const proxy = fixture.createPageProxy({
      pageNumber: 1,
      viewport: fixture.createViewport({
        width: 2000,
        height: 2000,
      }),
      items: [
        fixture.createTextItem({
          str: "Scaled",
          transform: [1, 0, 0, 1, 10, 20],
          width: 25,
          height: 12,
        }),
      ],
    });

    const sut = new PdfJsPage(proxy);
    const [fragment] = await sut.readTextFragments();

    expect(fragment).toEqual({
      pageNumber: 1,
      rawText: "Scaled",
      text: "Scaled",
      textType: "text",
      textSize: 1,
      boundingBox: {
        position: { x: 10, y: 20 },
        width: 25,
        height: 12,
      },
      font: {
        name: "unknown",
        size: 1,
      },
      fontSize: 1,
    });
  });

  it("should read page text in top to bottom and left to right order", async () => {
    const proxy = fixture.createPageProxy({
      pageNumber: 2,
      items: [
        fixture.createTextItem({
          str: "World",
          transform: [1, 0, 0, 1, 60, 100],
          width: 20,
          height: 12,
        }),
        fixture.createTextItem({
          str: "Hello",
          transform: [1, 0, 0, 1, 10, 100],
          width: 30,
          height: 12,
        }),
        fixture.createTextItem({
          str: "Again",
          transform: [1, 0, 0, 1, 10, 90],
          width: 25,
          height: 12,
        }),
      ],
    });

    const sut = new PdfJsPage(proxy);
    const result = await sut.readText();

    expect(result).toEqual({
      pageNumber: 2,
      text: "Hello World Again",
    });
  });

  it("should return immutable fragment collection", async () => {
    const proxy = fixture.createPageProxy({
      pageNumber: 1,
      items: [
        fixture.createTextItem({
          str: "Frozen",
          transform: [1, 0, 0, 1, 1, 2],
          width: 3,
          height: 4,
        }),
      ],
    });

    const sut = new PdfJsPage(proxy);
    const result = await sut.readTextFragments();

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result[0])).toBe(true);
  });
});
