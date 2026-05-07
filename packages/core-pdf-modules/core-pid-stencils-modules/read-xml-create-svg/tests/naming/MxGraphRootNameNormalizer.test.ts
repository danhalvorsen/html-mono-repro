import { describe, expect, it } from "vitest";

import { MxGraphRootNameNormalizer } from "../../src/index.js";

describe("MxGraphRootNameNormalizer", () => {
  it("should remove mxGraph prefix when source name has the known prefix", () => {
    const normalizer = new MxGraphRootNameNormalizer();

    const rootName = normalizer.normalize("mxGraph.pid.feeders");

    expect(rootName).toBe("pid.feeders");
  });

  it("should preserve source name when source name has no mxGraph prefix", () => {
    const normalizer = new MxGraphRootNameNormalizer();

    const rootName = normalizer.normalize("pid.feeders");

    expect(rootName).toBe("pid.feeders");
  });
});