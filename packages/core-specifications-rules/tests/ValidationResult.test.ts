// packages/core-specifications-rules/tests/ValidationResult.test.ts

import { describe, expect, it } from "vitest";
import { CrossPlatformTemplate } from "@monorepo/core-template";
import { ValidationMessage } from "../src/ValidationMessage.js";
import { ValidationResult } from "../src/ValidationResult.js";

describe("ValidationResult", () => {
  it("should create a successful result from ok", () => {
    const sut = ValidationResult.ok();

    expect(sut.isSuccess).toBe(true);
    expect(sut.errors).toEqual([]);
    expect(sut.renderErrors()).toEqual([]);
  });

  it("should create a failed result from a single validation message", () => {
    const error = new ValidationMessage(
      "RULE_FAILED",
      new CrossPlatformTemplate("Rule ${ruleName} failed"),
      { ruleName: "DemoRule" },
    );

    const sut = ValidationResult.fail(error);

    expect(sut.isSuccess).toBe(false);
    expect(sut.errors).toHaveLength(1);
    expect(sut.renderErrors()).toEqual(["Rule DemoRule failed"]);
  });

  it("should merge two failed results", () => {
    const first = ValidationResult.fail(
      new ValidationMessage(
        "RULE_1",
        new CrossPlatformTemplate("Rule ${ruleName} failed"),
        { ruleName: "RuleOne" },
      ),
    );

    const second = ValidationResult.fail(
      new ValidationMessage(
        "RULE_2",
        new CrossPlatformTemplate("Rule ${ruleName} failed"),
        { ruleName: "RuleTwo" },
      ),
    );

    const sut = first.merge(second);

    expect(sut.isSuccess).toBe(false);
    expect(sut.errors).toHaveLength(2);
    expect(sut.renderErrors()).toEqual([
      "Rule RuleOne failed",
      "Rule RuleTwo failed",
    ]);
  });

  it("should return ok when two successful results are merged", () => {
    const sut = ValidationResult.ok().merge(ValidationResult.ok());

    expect(sut.isSuccess).toBe(true);
    expect(sut.errors).toEqual([]);
  });
});