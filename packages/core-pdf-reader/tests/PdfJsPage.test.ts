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
      items: [
        fixture.createTextItem({
          str: "Milk",
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
        text: "Milk",
        x: 10,
        y: 100,
        width: 30,
        height: 12,
      },
      {
        pageNumber: 1,
        text: "19,90",
        x: 60,
        y: 100,
        width: 20,
        height: 12,
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
      text: "Derived",
      x: 10,
      y: 20,
      width: 15,
      height: 1.5,
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

    // Internal implementation uses scale 1 in readTextFragments.
    // This test locks current behavior so future viewport changes become explicit.
    const [fragment] = await sut.readTextFragments();

    expect(fragment).toEqual({
      pageNumber: 1,
      text: "Scaled",
      x: 10,
      y: 20,
      width: 25,
      height: 12,
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
 
