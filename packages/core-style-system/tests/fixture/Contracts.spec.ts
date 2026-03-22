import { describe, expect, it } from "vitest";

import type {
  IFillStyle,
  IStrokeStyle,
  IStyle,
  IStyleReference,
  IStyleToken,
} from "../../src/index.js";

describe("Style contracts", () => {
  it("should allow creation of a fill style contract", () => {
    const actual: IFillStyle = {
      color: "#ffffff",
    };

    expect(actual.color).toBe("#ffffff");
  });

  it("should allow creation of a stroke style contract", () => {
    const actual: IStrokeStyle = {
      color: "#000000",
      width: 2,
      dash: [2, 1],
    };

    expect(actual).toEqual({
      color: "#000000",
      width: 2,
      dash: [2, 1],
    });
  });

  it("should allow creation of a style contract", () => {
    const actual: IStyle = {
      stroke: {
        color: "red",
      },
      fill: {
        color: "blue",
      },
      opacity: 0.8,
    };

    expect(actual).toEqual({
      stroke: {
        color: "red",
      },
      fill: {
        color: "blue",
      },
      opacity: 0.8,
    });
  });

  it("should allow creation of a style reference contract", () => {
    const actual: IStyleReference = {
      token: "primary",
      overrides: {
        opacity: 0.5,
      },
    };

    expect(actual.token).toBe("primary");
    expect(actual.overrides?.opacity).toBe(0.5);
  });

  it("should allow creation of a style token contract", () => {
    const actual: IStyleToken = {
      name: "primary",
      extends: ["base"],
      style: {
        stroke: {
          color: "#2563eb",
        },
      },
    };

    expect(actual).toEqual({
      name: "primary",
      extends: ["base"],
      style: {
        stroke: {
          color: "#2563eb",
        },
      },
    });
  });
});