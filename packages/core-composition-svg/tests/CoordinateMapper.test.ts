import { describe, it, expect } from "vitest";
import { CoordinateMapper, type CartesianPoint, type SvgPoint } from "../src/CoordinateMapper.js";

describe("CoordinateMapper", () => {
  const width = 400;
  const height = 300;
  const scale = 2;
  const mapper = new CoordinateMapper(width, height, scale);

  it("converts Cartesian to SVG with centered origin and flipped Y", () => {
    const p: CartesianPoint = { x: 10, y: -5 };
    const svg = mapper.toSvgPoint(p);
    expect(svg).toEqual({ x: width / 2 + 10 * scale, y: height / 2 + 5 * scale });
  });

  it("converts SVG to Cartesian with centered origin and flipped Y", () => {
    const p: SvgPoint = { x: width / 2 + 20, y: height / 2 - 40 };
    const cart = mapper.toCartesianPoint(p);
    expect(cart).toEqual({ x: 10, y: 20 });
  });

  it("round-trips Cartesian -> SVG -> Cartesian", () => {
    const original: CartesianPoint = { x: -15, y: 7 };
    const svg = mapper.toSvgPoint(original);
    const back = mapper.toCartesianPoint(svg);
    expect(back).toEqual(original);
  });
});
