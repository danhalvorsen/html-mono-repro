import { describe, expect, it } from "vitest";

import { SvgCartesianCoordinateMapper } from "../src/CoordinateMapper.js";

describe("SvgCartesianCoordinateMapper", () => {
  it("should map cartesian coordinates to svg coordinates", () => {
    const mapper = new SvgCartesianCoordinateMapper({
      width: 300,
      height: 200,
    });

    expect(mapper.toSvg({ x: 20, y: 30 })).toEqual({ x: 170, y: 70 });
  });

  it("should map svg coordinates back to cartesian coordinates", () => {
    const mapper = new SvgCartesianCoordinateMapper({
      width: 300,
      height: 200,
    });

    expect(mapper.toCartesian({ x: 170, y: 70 })).toEqual({ x: 20, y: 30 });
  });
});
