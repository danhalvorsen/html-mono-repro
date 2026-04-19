import { describe, expect, it } from "vitest";
import {
  Arithmetic,
  Font,
  Guard,
  ImageFragment,
  Point,
  Rectangle,
  TextFragment,
  TextFragmentFactory,
} from "../src/index.js";

function makeRect(id = "r", x = 0, y = 0, width = 10, height = 10): Rectangle {
  return Rectangle.create({ id, position: { x, y }, width, height });
}

describe("runtime coverage", () => {
  it("covers Arithmetic happy paths", () => {
    const ArithmeticCtor = Arithmetic as unknown as { new(): unknown };
    expect(() => new ArithmeticCtor()).not.toThrow();

    expect(Arithmetic.PointsPerInch).toBe(72);
    expect(Arithmetic.MillimetersPerInch).toBe(25.4);
    expect(Arithmetic.CentimetersPerInch).toBe(2.54);

    expect(Arithmetic.clamp(20, 10, 15)).toBe(15);
    expect(Arithmetic.clamp(12, 15, 10)).toBe(12);
    expect(Arithmetic.nearlyEqual(1, 1 + 1e-10)).toBe(true);

    expect(Arithmetic.pointsToInches(72)).toBe(1);
    expect(Arithmetic.inchesToPoints(2)).toBe(144);
    expect(Arithmetic.pointsToMillimeters(72)).toBeCloseTo(25.4, 9);
    expect(Arithmetic.millimetersToPoints(25.4)).toBeCloseTo(72, 9);
    expect(Arithmetic.pointsToCentimeters(72)).toBeCloseTo(2.54, 9);
    expect(Arithmetic.centimetersToPoints(2.54)).toBeCloseTo(72, 9);

    expect(Arithmetic.degreesToRadians(180)).toBeCloseTo(Math.PI, 9);
    expect(Arithmetic.radiansToDegrees(Math.PI)).toBeCloseTo(180, 9);
    expect(Arithmetic.round(1.2345, 2)).toBe(1.23);
  });

  it("covers Arithmetic guard branches", () => {
    expect(() => Arithmetic.clamp(Number.NaN, 0, 1)).toThrow("must be finite");
    expect(() => Arithmetic.nearlyEqual(1, 1, -1)).toThrow("must be non-negative");
    expect(() => Arithmetic.pointsToInches(Number.POSITIVE_INFINITY)).toThrow("must be finite");
    expect(() => Arithmetic.inchesToPoints(Number.NaN)).toThrow("must be finite");
    expect(() => Arithmetic.millimetersToPoints(Number.NaN)).toThrow("must be finite");
    expect(() => Arithmetic.centimetersToPoints(Number.NaN)).toThrow("must be finite");
    expect(() => Arithmetic.degreesToRadians(Number.NaN)).toThrow("must be finite");
    expect(() => Arithmetic.radiansToDegrees(Number.NaN)).toThrow("must be finite");
    expect(() => Arithmetic.round(1, -1)).toThrow("must be non-negative");
  });

  it("covers Guard branches", () => {
    expect(() => Guard.finite(Number.NaN, "x")).toThrow("must be finite");
    expect(() => Guard.nonNegative(-1, "x")).toThrow("must be non-negative");
    expect(() => Guard.nonNegativeInteger(-1, "x")).toThrow("non-negative integer");
    expect(() => Guard.positiveInteger(0, "x")).toThrow("positive integer");
    expect(() => Guard.nonEmpty("   ", "x")).toThrow("is required");

    expect(() => Guard.finite(1, "x")).not.toThrow();
    expect(() => Guard.nonNegative(0, "x")).not.toThrow();
    expect(() => Guard.nonNegativeInteger(0, "x")).not.toThrow();
    expect(() => Guard.positiveInteger(1, "x")).not.toThrow();
    expect(() => Guard.nonEmpty("ok", "x")).not.toThrow();
  });

  it("covers Point methods", () => {
    const p = Point.create(1.25, 2.75);
    const q = Point.from({ x: 0.75, y: 1.25 });

    expect(p.add(q).toJSON()).toEqual({ x: 2, y: 4 });
    expect(p.subtract(q).toJSON()).toEqual({ x: 0.5, y: 1.5 });
    expect(p.translate(1, -1).toJSON()).toEqual({ x: 2.25, y: 1.75 });
    expect(p.scale(2).toJSON()).toEqual({ x: 2.5, y: 5.5 });
    expect(p.distanceTo(q)).toBeCloseTo(Math.hypot(0.5, 1.5), 9);
    expect(p.equals(Point.create(1.25, 2.75))).toBe(true);
    expect(p.equals(Point.create(0, 0))).toBe(false);
    expect(Point.create(1.234, 2.345).round().toJSON()).toEqual({ x: 1, y: 2 });
    expect(Point.create(1.234, 2.345).round(2).toJSON()).toEqual({ x: 1.23, y: 2.35 });

    expect(() => Point.create(Number.NaN, 0)).toThrow("must be finite");
    expect(() => p.translate(Number.NaN, 0)).toThrow("must be finite");
    expect(() => p.scale(Number.NaN)).toThrow("must be finite");
    expect(() => p.round(-1)).toThrow("must be non-negative");
  });

  it("covers Font behaviors", () => {
    const empty = Font.create();
    expect(empty.toJSON()).toEqual({ raw: null, name: null, family: null, size: null });

    const withFiniteSize = Font.create({ raw: { foo: 1 }, name: "N", family: "F", size: 10 });
    expect(withFiniteSize.toJSON()).toEqual({ raw: { foo: 1 }, name: "N", family: "F", size: 10 });

    const withInvalidSize = Font.create({ size: Number.NaN });
    expect(withInvalidSize.size).toBeNull();

    expect(withFiniteSize.withSize(12).size).toBe(12);
    expect(withFiniteSize.withSize(null).size).toBeNull();
  });

  it("covers Fragment/ImageFragment and Rectangle.fromTextFragment", () => {
    const image = new ImageFragment({
      index: 1,
      pageNumber: 1,
      rectangle: makeRect("img", 1, 2, 3, 4),
      name: null,
      mimeType: undefined,
      bytes: new Uint8Array([1, 2]),
    });

    expect(image.kind).toBe("image");
    expect(image.id).toBe("img");
    expect(image.name).toBeUndefined();
    expect(image.mimeType).toBeUndefined();
    expect(image.bytes).toEqual(new Uint8Array([1, 2]));

    const moved = image.translate(2, 3);
    expect(moved.rectangle.left).toBe(3);
    expect(moved.rectangle.top).toBe(5);

    const scaled = image.scaleGeometry(2);
    expect(scaled.rectangle.width).toBe(6);
    expect(scaled.rectangle.height).toBe(8);

    expect(image.intersects({ rectangle: makeRect("o", 2, 2, 1, 1) })).toBe(true);
    expect(image.contains({ x: 2, y: 3 })).toBe(true);

    expect(() => image.translate(Number.NaN, 1)).toThrow("must be finite");
    expect(() => image.translate(1, Number.NaN)).toThrow("must be finite");
    expect(() => image.scaleGeometry(0)).toThrow("must be > 0");
    expect(() => image.intersects(null as unknown as { readonly rectangle: Rectangle })).toThrow("is required");
    expect(() => image.contains(null as unknown as { x: number; y: number })).toThrow("is required");
    expect(() => new ImageFragment({ index: 0, pageNumber: 1, rectangle: null as unknown as Rectangle })).toThrow("is required");

    const imageWithMeta = new ImageFragment({
      index: 2,
      pageNumber: 1,
      rectangle: makeRect("img2", 0, 0, 1, 1),
      name: "logo",
      mimeType: "image/png",
      bytes: new Uint8Array([9]),
    });
    const movedWithMeta = imageWithMeta.translate(1, 1);
    expect(movedWithMeta.name).toBe("logo");
    expect(movedWithMeta.mimeType).toBe("image/png");
    expect(movedWithMeta.bytes).toEqual(new Uint8Array([9]));

    const imageNoMeta = new ImageFragment({
      index: 3,
      pageNumber: 1,
      rectangle: makeRect("img3", 0, 0, 1, 1),
    });
    const movedNoMeta = imageNoMeta.translate(1, 1);
    expect(movedNoMeta.name).toBeUndefined();
    expect(movedNoMeta.mimeType).toBeUndefined();
    expect(movedNoMeta.bytes).toBeUndefined();

    const rectFromText = Rectangle.fromTextFragment(
      {
        pageNumber: 2,
        text: "x",
        boundingBox: {
          position: { x: 10, y: 20 },
          width: 30,
          height: 40,
        },
        fontName: null,
        fontFamily: null,
        fontSize: null,
      },
      5,
    );
    expect(rectFromText.id).toBe("p2-5");
    expect(rectFromText.left).toBe(10);
    expect(() => Rectangle.fromTextFragment({ pageNumber: 1, text: "x", boundingBox: { position: { x: 0, y: 0 }, width: 1, height: 1 } }, -1)).toThrow("non-negative integer");
    expect(() => Rectangle.union("u", [])).toThrow("cannot be empty");
  });

  it("covers TextFragment and TextFragmentFactory branches", () => {
    const source = {
      pageNumber: 1,
      text: "hello",
      boundingBox: {
        position: { x: 1, y: 2 },
        width: 3,
        height: 4,
      },
      fontName: null,
      fontFamily: undefined,
      fontSize: 11,
    };

    const fragment = TextFragment.fromSource(source, 7);
    expect(fragment.kind).toBe("text");
    expect(fragment.fontName).toBeUndefined();
    expect(fragment.fontFamily).toBeUndefined();
    expect(fragment.fontSize).toBe(11);

    const withText = fragment.withText("world");
    expect(withText.text).toBe("world");

    const movedNoFont = withText.translate(1, 1);
    expect(movedNoFont.fontName).toBeUndefined();
    expect(movedNoFont.fontFamily).toBeUndefined();

    const noSize = TextFragment.fromSource({
      pageNumber: 1,
      text: "no-size",
      boundingBox: {
        position: { x: 0, y: 0 },
        width: 1,
        height: 1,
      },
      fontName: null,
      fontFamily: null,
      fontSize: undefined,
    }, 8).withText("still-no-size");
    expect(noSize.fontSize).toBeUndefined();

    const withFontKeep = withText.withFont({});
    expect(withFontKeep.fontSize).toBe(11);

    const withFontSet = withText.withFont({ fontName: "A", fontFamily: "B", fontSize: null });
    expect(withFontSet.fontName).toBe("A");
    expect(withFontSet.fontFamily).toBe("B");
    expect(withFontSet.fontSize).toBeUndefined();

    const moved = withFontSet.translate(2, 3);
    expect(moved.rectangle.left).toBe(3);
    expect(moved.rectangle.top).toBe(5);

    const scaled = withFontSet.scaleGeometry(2);
    expect(scaled.rectangle.width).toBe(6);
    expect(scaled.rectangle.height).toBe(8);

    const toSource = withFontSet.toSource();
    expect(toSource.fontName).toBe("A");
    expect(toSource.fontFamily).toBe("B");
    expect(toSource.fontSize).toBeUndefined();

    const toSourceNoFont = withText.toSource();
    expect(toSourceNoFont.fontName).toBeUndefined();
    expect(toSourceNoFont.fontFamily).toBeUndefined();

    const factory = new TextFragmentFactory();
    const fromFactory = factory.create({
      pageNumber: 1,
      text: "factory",
      boundingBox: {
        position: { x: 0, y: 0 },
        width: 1,
        height: 1,
      },
      fontName: "F",
      fontFamily: "FF",
      fontSize: 9,
    }, 2);

    expect(fromFactory.text).toBe("factory");
    expect(fromFactory.fontName).toBe("F");
  });
});
