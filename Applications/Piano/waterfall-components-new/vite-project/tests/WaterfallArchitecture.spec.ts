import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function readSource(relativeUrl: string): string {
  return readFileSync(new URL(relativeUrl, import.meta.url), "utf8");
}

describe("Waterfall architecture", () => {
  it("delegates GravityFalling size calculation to a size policy", () => {
    const source = readSource("../src/component/Waterfall.ts");

    expect(source).toContain("IGravityFallingSizePolicy");
    expect(source).toMatch(
      /private\s+readonly\s+\w*sizePolicy\w*\s*:\s*IGravityFallingSizePolicy/i,
    );
    expect(source).toMatch(/\.createSize\(/);
  });

  it("does not own GravityFalling height policy constants", () => {
    const source = readSource("../src/component/Waterfall.ts");

    expect(source).not.toMatch(/MinimumGravityFallingHeightPixels/);
    expect(source).not.toMatch(/MaximumGravityFallingHeightPixels/);
    expect(source).not.toMatch(/GravityFallingHeightPixelsPerMillisecond/);
  });

  it("does not calculate GravityFalling height directly", () => {
    const source = readSource("../src/component/Waterfall.ts");

    expect(source).not.toMatch(/calculateGravityFallingHeight\s*\(/);
    expect(source).not.toMatch(/calculateGravityFallingWidth\s*\(/);
    expect(source).not.toMatch(/createGravityFallingSize\s*\(/);
  });
});
