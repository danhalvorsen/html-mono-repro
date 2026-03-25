// packages/core.module.example/core.module.example.nodejs/tests/calculator.test.ts
import { describe, expect, it } from "vitest";
import { calculationErrorCodes } from "../src/index.js"
import { calculate } from "../src/code.js";

describe("calculate", () => {
  it("should create a valid result when add input is valid", () => {
    const result = calculate({
      operator: "add",
      left: 8,
      right: 4,
    });

    expect(result).toEqual({
      success: true,
      value: 12,
    });
  });

  it("should create a valid result when subtract input is valid", () => {
    const result = calculate({
      operator: "subtract",
      left: 8,
      right: 4,
    });

    expect(result).toEqual({
      success: true,
      value: 4,
    });
  });

  it("should create a valid result when multiply input is valid", () => {
    const result = calculate({
      operator: "multiply",
      left: 8,
      right: 4,
    });

    expect(result).toEqual({
      success: true,
      value: 32,
    });
  });

  it("should create a valid result when divide input is valid", () => {
    const result = calculate({
      operator: "divide",
      left: 8,
      right: 4,
    });

    expect(result).toEqual({
      success: true,
      value: 2,
    });
  });

  it("should reject division when right operand is zero", () => {
    const result = calculate({
      operator: "divide",
      left: 8,
      right: 0,
    });

    expect(result).toEqual({
      success: false,
      error: calculationErrorCodes.divisionByZero,
      message: "Division by zero is not allowed.",
    });
  });

  it("should reject input when left operand is not finite", () => {
    const result = calculate({
      operator: "add",
      left: Number.NaN,
      right: 4,
    });

    expect(result).toEqual({
      success: false,
      error: calculationErrorCodes.invalidNumber,
      message: "Operands must be finite numbers.",
    });
  });

  it("should reject input when right operand is not finite", () => {
    const result = calculate({
      operator: "multiply",
      left: 8,
      right: Number.POSITIVE_INFINITY,
    });

    expect(result).toEqual({
      success: false,
      error: calculationErrorCodes.invalidNumber,
      message: "Operands must be finite numbers.",
    });
  });
});