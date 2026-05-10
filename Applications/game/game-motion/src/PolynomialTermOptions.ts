export type PolynomialTermTuple = readonly [
  exponent: number,
  coefficient: number,
];

export type ScalarPolynomialExpressionOptions = readonly PolynomialTermTuple[];
