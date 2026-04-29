
import { describe, expect, it } from "vitest";
import * as validatorsModule from "../src/index.js";

describe("core-graph-pathfinding-domain-validators module", () => {
  it("exports validator types and factories", () => {
    const exported = Object.keys(validatorsModule);

    expect(exported).toContain("ValidationGuard");
    expect(exported).toContain("CompositeValidator");
    expect(exported).toContain("PathfindingRequestValidator");
    expect(exported).toContain("PathfindingRequestValidatorFactory");
  });
});