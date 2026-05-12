// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import type { IElementTargetMatcher } from "@src/PureAnimation/Base/IElementTargetMatcher.ts";
import { SlotValidator } from "@src/PureAnimation/Base/SlotValidator.ts";

type TargetElement = Element & { readonly role: "target" };

class TargetMatcher implements IElementTargetMatcher<TargetElement> {
  public matches(element: Element): element is TargetElement {
    return "role" in element && (element as { role?: unknown }).role === "target";
  }
}

describe("SlotValidator", () => {
  it("should return matching targets when all elements are valid", () => {
    const validator = new SlotValidator<TargetElement>(
      new TargetMatcher(),
      "invalid target element",
    );
    const first = document.createElement("div") as TargetElement;
    const second = document.createElement("div") as TargetElement;
    Object.defineProperty(first, "role", { value: "target" });
    Object.defineProperty(second, "role", { value: "target" });

    const result = validator.validateAndGetTargets([first, second]);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(first);
    expect(result[1]).toBe(second);
  });

  it("should throw when at least one element does not satisfy the matcher", () => {
    const validator = new SlotValidator<TargetElement>(
      new TargetMatcher(),
      "invalid target element",
    );
    const valid = document.createElement("div") as TargetElement;
    const invalid = document.createElement("span");
    Object.defineProperty(valid, "role", { value: "target" });

    expect(() => validator.validateAndGetTargets([valid, invalid])).toThrowError(
      "invalid target element",
    );
  });

  it("should return an empty array when no elements are provided", () => {
    const validator = new SlotValidator<TargetElement>(
      new TargetMatcher(),
      "invalid target element",
    );

    const result = validator.validateAndGetTargets([]);

    expect(result).toEqual([]);
  });
});
