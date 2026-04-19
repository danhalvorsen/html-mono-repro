import { describe, expect, it } from "vitest";
import {
  createScaleMatrix,
  createTranslationMatrix,
  formatSvgMatrix,
  IDENTITY_MATRIX_3X3,
  isIdentityMatrix3x3,
  multiplyMatrix3x3,
} from "../src/domain/matrix3x3.js";

describe("Matrix3x3", () => {
  it("exposes an immutable identity matrix", () => {
    expect(isIdentityMatrix3x3(IDENTITY_MATRIX_3X3)).toBe(true);
    expect(Object.isFrozen(IDENTITY_MATRIX_3X3)).toBe(true);
    expect(Object.isFrozen(IDENTITY_MATRIX_3X3[0])).toBe(true);
  });

  it("formats matrix values for SVG transform attributes", () => {
    expect(formatSvgMatrix(createTranslationMatrix(10, 20))).toBe(
      "matrix(1 0 0 1 10 20)",
    );
  });

  it("multiplies matrices deterministically", () => {
    const matrix = multiplyMatrix3x3(
      createTranslationMatrix(10, 20),
      createScaleMatrix(2, 3),
    );

    expect(matrix).toEqual([
      [2, 0, 10],
      [0, 3, 20],
      [0, 0, 1],
    ]);
  });
});
