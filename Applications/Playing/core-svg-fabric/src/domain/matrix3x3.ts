import { assertFinite } from "./number-guards.js";

export type Matrix3x3 = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
];

function createMatrix3x3(
  row0: readonly [number, number, number],
  row1: readonly [number, number, number],
  row2: readonly [number, number, number],
): Matrix3x3 {
  return Object.freeze([
    Object.freeze(row0),
    Object.freeze(row1),
    Object.freeze(row2),
  ]);
}

export const IDENTITY_MATRIX_3X3: Matrix3x3 = createMatrix3x3(
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
);

export function createTranslationMatrix(tx: number, ty: number): Matrix3x3 {
  assertFinite(tx, "tx");
  assertFinite(ty, "ty");

  return createMatrix3x3([1, 0, tx], [0, 1, ty], [0, 0, 1]);
}

export function createScaleMatrix(sx: number, sy: number): Matrix3x3 {
  assertFinite(sx, "sx");
  assertFinite(sy, "sy");

  return createMatrix3x3([sx, 0, 0], [0, sy, 0], [0, 0, 1]);
}

export function createRotationMatrix(angleRadians: number): Matrix3x3 {
  assertFinite(angleRadians, "angleRadians");

  const cos = Math.cos(angleRadians);
  const sin = Math.sin(angleRadians);

  return createMatrix3x3([cos, -sin, 0], [sin, cos, 0], [0, 0, 1]);
}

export function multiplyMatrix3x3(left: Matrix3x3, right: Matrix3x3): Matrix3x3 {
  return createMatrix3x3(
    [
      left[0][0] * right[0][0] + left[0][1] * right[1][0] + left[0][2] * right[2][0],
      left[0][0] * right[0][1] + left[0][1] * right[1][1] + left[0][2] * right[2][1],
      left[0][0] * right[0][2] + left[0][1] * right[1][2] + left[0][2] * right[2][2],
    ],
    [
      left[1][0] * right[0][0] + left[1][1] * right[1][0] + left[1][2] * right[2][0],
      left[1][0] * right[0][1] + left[1][1] * right[1][1] + left[1][2] * right[2][1],
      left[1][0] * right[0][2] + left[1][1] * right[1][2] + left[1][2] * right[2][2],
    ],
    [
      left[2][0] * right[0][0] + left[2][1] * right[1][0] + left[2][2] * right[2][0],
      left[2][0] * right[0][1] + left[2][1] * right[1][1] + left[2][2] * right[2][1],
      left[2][0] * right[0][2] + left[2][1] * right[1][2] + left[2][2] * right[2][2],
    ],
  );
}

export function isIdentityMatrix3x3(matrix: Matrix3x3): boolean {
  return (
    matrix[0][0] === 1 &&
    matrix[0][1] === 0 &&
    matrix[0][2] === 0 &&
    matrix[1][0] === 0 &&
    matrix[1][1] === 1 &&
    matrix[1][2] === 0 &&
    matrix[2][0] === 0 &&
    matrix[2][1] === 0 &&
    matrix[2][2] === 1
  );
}

export function formatSvgMatrix(matrix: Matrix3x3): string {
  return `matrix(${matrix[0][0]} ${matrix[1][0]} ${matrix[0][1]} ${matrix[1][1]} ${matrix[0][2]} ${matrix[1][2]})`;
}
