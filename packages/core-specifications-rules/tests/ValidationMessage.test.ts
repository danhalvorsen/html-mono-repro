// packages/core-specifications-rules/tests/ValidationMessage.test.ts

import { describe, expect, it } from "vitest";
import { CrossPlatformTemplate } from "@monorepo/core-template";
import { ValidationMessage } from "../src/ValidationMessage.js";

describe("ValidationMessage", () => {
  it("should render the template using the provided model", () => {
    const sut = new ValidationMessage(
      "POINT_OUTSIDE_RECTANGLE",
      new CrossPlatformTemplate("Rule ${ruleName}: point (${pointX},${pointY}) is outside rectangle"),
      {
        ruleName: "PointInsideRectangle",
        pointX: 50,
        pointY: 50,
      },
    );

    expect(sut.code).toBe("POINT_OUTSIDE_RECTANGLE");
    expect(sut.render()).toBe(
      "Rule PointInsideRectangle: point (50,50) is outside rectangle",
    );
  });
});

