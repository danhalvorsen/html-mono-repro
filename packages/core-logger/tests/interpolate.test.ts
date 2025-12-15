// tests/interpolate.test.ts
import { describe, it, expect } from "vitest";
import { interpolateTemplate } from "../src/utils/interpolate.js"
import {
  templateSimple,
  templateWithParams,
  templateMissing,
  sampleParams,
} from "./fixtures/messageFixture.js"

describe("interpolateTemplate()", () => {
  it("returns plain template when no params", () => {
    const out = interpolateTemplate(templateSimple);
    expect(out).toBe(templateSimple);
  });

  it("interpolates parameters", () => {
    const out = interpolateTemplate(templateWithParams, sampleParams);
    expect(out.includes("index.ts")).toBe(true);
    expect(out.includes("42")).toBe(true);
  });

  it("keeps unknown placeholders intact", () => {
    const out = interpolateTemplate(templateMissing, sampleParams);
    expect(out).toBe("Unknown {missingKey}");
  });
});
