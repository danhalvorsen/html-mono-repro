// packages/core-specifications/tests/ValidationResult.spec.ts

import { describe, expect, it } from "vitest";
import { ValidationResult } from "../src/validation/ValidationResult.js";

describe("ValidationResult", () => {
  it("should create a successful result from ok", () => {
    const result = ValidationResult.ok();

    expect(result.isSuccess).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should create a failed result from a single message", () => {
    const result = ValidationResult.fail("failed");

    expect(result.isSuccess).toBe(false);
    expect(result.errors).toEqual(["failed"]);
  });

  it("should merge two failed results", () => {
    const result = ValidationResult.fail("a").merge(
      ValidationResult.fail("b"),
    );

    expect(result.isSuccess).toBe(false);
    expect(result.errors).toEqual(["a", "b"]);
  });
});