import { describe, it, expect } from "vitest";
import { boxText } from "../src/utils/textFormatting.js";

describe("textFormatting.boxText", () => {
  it("wraps text in a single-line box", () => {
    const result = boxText("Hello", { borderChar: "─" });

    expect(result).toContain("──────");      // top/bottom border
    expect(result).toContain("│ Hello │");   // centered line
  });

  it("supports multi-line formatting", () => {
    const msg = "Line1\nLine2";
    const result = boxText(msg, { borderChar: "─" });

    const lines = result.split("\n");

    expect(lines[0].startsWith("──")).toBe(true);
    expect(lines[1]).toContain("Line1");
    expect(lines[2]).toContain("Line2");
    expect(lines[lines.length - 1].startsWith("──")).toBe(true);
  });

  it("pads content correctly", () => {
    const result = boxText("A", { borderChar: "*" });

    expect(result).toContain("│ A │");
    expect(result.startsWith("***")).toBe(true);
    expect(result.endsWith("***")).toBe(true);
  });
});
