import { describe, expect, it } from "vitest";
import { Vector2 } from "@monorepo/core-math";

import { VexVertex } from "../../src/index.js";

describe("VexVertex", () => {
  it("should default id to 'id' and allow overriding it", () => {
    const vertex = new VexVertex(new Vector2(10, 20));

    expect(vertex.getId()).toBe("id");

    vertex.setId("vertex-1");

    expect(vertex.getId()).toBe("vertex-1");
  });

  it("should accept an id in the constructor", () => {
    const vertex = new VexVertex(
      new Vector2(10, 20),
      6,
      true,
      true,
      "start-vertex",
    );

    expect(vertex.getId()).toBe("start-vertex");
  });
});
