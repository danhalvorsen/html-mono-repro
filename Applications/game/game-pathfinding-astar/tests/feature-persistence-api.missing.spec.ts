import { describe, expect, it } from "vitest";
import * as astarModule from "../src/index.js";

describe("feature: persistence api", () => {
  it("exports serializeRequest/deserializeRequest", () => {
    const api = astarModule as Record<string, unknown>;
    expect(typeof api.serializeRequest).toBe("function");
    expect(typeof api.deserializeRequest).toBe("function");
  });
});
