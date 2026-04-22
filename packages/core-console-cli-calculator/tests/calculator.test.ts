import { describe, expect, it } from "vitest";

import { evaluateExpression } from "../src/cli-calculator.ts";

describe("evaluateExpression", () => {
  it("evaluates addition", () => {
    expect(evaluateExpression("1 + 2")).toBe(3);
  });

  it("evaluates subtraction", () => {
    expect(evaluateExpression("10 - 7")).toBe(3);
  });

  it("evaluates multiplication", () => {
    expect(evaluateExpression("3 * 4")).toBe(12);
  });

  it("evaluates division", () => {
    expect(evaluateExpression("9 / 3")).toBe(3);
  });

  it("throws for division by zero", () => {
    expect(() => evaluateExpression("10 / 0")).toThrow("Division by zero");
  });

  it("throws for invalid expression", () => {
    expect(() => evaluateExpression("abc")).toThrow("Invalid expression");
  });
});
