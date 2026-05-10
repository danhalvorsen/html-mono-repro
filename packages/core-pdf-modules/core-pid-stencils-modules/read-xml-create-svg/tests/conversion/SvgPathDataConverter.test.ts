import { describe, expect, it } from "vitest";

import type { MxGraphPathCommand } from "../../src/index.js";
import { MxGraphShapeTestFixture } from "../fixtures/MxGraphShapeTestFixture.js";

describe("SvgPathDataConverter", () => {
  const fixture = new MxGraphShapeTestFixture();

  it("should convert mxGraph path commands to SVG path data", () => {
    const commands: readonly MxGraphPathCommand[] = [
      { kind: "move", x: 1, y: 2 },
      { kind: "line", x: 3, y: 4 },
      {
        kind: "arc",
        rx: 5,
        ry: 6,
        xAxisRotation: 0,
        largeArcFlag: 1,
        sweepFlag: 1,
        x: 7,
        y: 8
      },
      { kind: "close" }
    ];

    const pathData = fixture.createPathDataConverter().convert(commands);

    expect(pathData).toBe("M 1 2 L 3 4 A 5 6 0 1 1 7 8 Z");
  });
});