import { describe, it, expect } from "vitest";
import { interpolateTemplate } from "../src/utils/interpolate.js";

describe("interpolateTemplate", () => {
  it("replaces placeholders", () => {
    const out = interpolateTemplate("Hello {name}", { name: "Dan" });
    expect(out).toContain("Dan");
  });
});
