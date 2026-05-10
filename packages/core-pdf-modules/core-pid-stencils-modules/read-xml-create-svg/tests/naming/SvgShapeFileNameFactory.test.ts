import { describe, expect, it } from "vitest";

import type { SvgShape } from "../../src/index.js";
import { SvgShapeFileNameFactory } from "../../src/index.js";

describe("SvgShapeFileNameFactory", () => {
  it("should create filename from root name and original shape name", () => {
    const factory = new SvgShapeFileNameFactory();

    const fileName = factory.create(createShape("pid.feeders", "Feeder (Rotary Table)"));

    expect(fileName).toBe("pid.feeders-Feeder (Rotary Table).svg");
  });

  it("should replace invalid Windows filename characters without changing valid domain text", () => {
    const factory = new SvgShapeFileNameFactory();

    const fileName = factory.create(createShape("pid:feeders", 'Valve "A/B"'));

    expect(fileName).toBe("pid-feeders-Valve -A-B-.svg");
  });

  function createShape(rootName: string, name: string): SvgShape {
    return {
      rootName,
      name,
      width: 100,
      height: 100,
      aspect: "variable",
      strokeWidth: "inherit",
      connections: [],
      background: [],
      foreground: []
    };
  }
});