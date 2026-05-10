import { ScalarPolynomialExpressionOptions } from "./PolynomialTermOptions.js";

export interface ParametricAxisExpressionOptions {
  /**
   * x(t), vx(t), or ax(t), depending on owner context.
   */
  readonly x: ScalarPolynomialExpressionOptions;

  /**
   * y(t), vy(t), or ay(t), depending on owner context.
   */
  readonly y: ScalarPolynomialExpressionOptions;
}
