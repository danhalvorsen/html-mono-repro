import { describe, expect, it } from "vitest";

import { PdfJsTextBoundingBoxIdentifier } from "../src/PdfJsTextBoundingBoxIdentifier.js";

describe("PdfJsTextBoundingBoxIdentifier", () => {
  it("Given unrotated text item When identify Then quad and bounds are computed", () => {
    const sut = new PdfJsTextBoundingBoxIdentifier();

    const result = sut.identify(
      {
        str: "PIZZA GRANDIOSA",
        transform: [1, 0, 0, 1, 10, 100],
        width: 30,
        height: 12,
      },
      {
        transform: [1, 0, 0, 1, 0, 0],
      },
    );

    expect(result.text).toBe("PIZZA GRANDIOSA");
    expect(result.angleRadians).toBe(0);
    expect(result.quad.topLeft).toEqual({ x: 10, y: 88 });
    expect(result.quad.topRight).toEqual({ x: 40, y: 88 });
    expect(result.quad.bottomRight).toEqual({ x: 40, y: 100 });
    expect(result.quad.bottomLeft).toEqual({ x: 10, y: 100 });
    expect(result.bounds.left).toBe(10);
    expect(result.bounds.top).toBe(88);
    expect(result.bounds.width).toBe(30);
    expect(result.bounds.height).toBe(12);
  });

  it("Given missing explicit height When identify Then transformed height is used", () => {
    const sut = new PdfJsTextBoundingBoxIdentifier();

    const result = sut.identify(
      {
        str: "Price",
        transform: [1, 0, 0, 1.5, 20, 40],
        width: 25,
        height: 0,
      },
      {
        transform: [1, 0, 0, 1, 0, 0],
      },
    );

    expect(result.bounds.left).toBe(20);
    expect(result.bounds.top).toBe(38.5);
    expect(result.bounds.width).toBe(25);
    expect(result.bounds.height).toBe(1.5);
  });

  it("Given rotated text item When identify Then rotated quad and enclosing bounds are computed", () => {
    const sut = new PdfJsTextBoundingBoxIdentifier();

    const result = sut.identify(
      {
        str: "NOK",
        transform: [0, 1, -1, 0, 100, 50],
        width: 10,
        height: 4,
      },
      {
        transform: [1, 0, 0, 1, 0, 0],
      },
    );

    expect(result.angleRadians).toBeCloseTo(-Math.PI / 2);
    expect(result.quad.topLeft.x).toBeCloseTo(96);
    expect(result.quad.topLeft.y).toBeCloseTo(50);
    expect(result.quad.bottomRight.x).toBeCloseTo(100);
    expect(result.quad.bottomRight.y).toBeCloseTo(40);
    expect(result.bounds.left).toBeCloseTo(96);
    expect(result.bounds.top).toBeCloseTo(40);
    expect(result.bounds.width).toBeCloseTo(4);
    expect(result.bounds.height).toBeCloseTo(10);
  });

  it("Given multiple items When identifyMany Then an immutable collection is returned", () => {
    const sut = new PdfJsTextBoundingBoxIdentifier();

    const result = sut.identifyMany(
      [
        {
          str: "A",
          transform: [1, 0, 0, 1, 1, 2],
          width: 3,
          height: 4,
        },
        {
          str: "B",
          transform: [1, 0, 0, 1, 5, 6],
          width: 7,
          height: 8,
        },
      ],
      {
        transform: [1, 0, 0, 1, 0, 0],
      },
    );

    expect(result).toHaveLength(2);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result[0]!)).toBe(true);
  });
});
