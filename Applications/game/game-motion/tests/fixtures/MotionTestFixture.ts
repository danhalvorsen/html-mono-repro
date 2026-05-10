// FILE: tests/fixtures/MotionTestFixture.ts

import { expect, should } from "chai";
import { ParametricMotion } from "../../src/ParametricMotion";
import { ParametricMotionFromAccelerationFactory } from "../../src/ParametricMotionFromAccelerationFactory";
import type { PhysicalMovementDefinitionOptions } from "../../src/PhysicalMovementDefinitionOptions";
import type { Vector2 } from "../../src/Vector2";
import { PolynomialExpression } from "../../src";

should();

export class MotionTestFixture {
  public createPolynomial(
    terms: readonly (readonly [number, number])[],
  ): PolynomialExpression {
    return new PolynomialExpression(terms);
  }

  public createMotionFromPhysicalDefinition(
    physical: PhysicalMovementDefinitionOptions,
  ): ParametricMotion {
    const math = new ParametricMotionFromAccelerationFactory().create(physical);

    return new ParametricMotion(math);
  }

  public assertClose(
    actual: number,
    expected: number,
    tolerance = 0.000001,
  ): void {
    expect(actual).to.be.closeTo(expected, tolerance);
  }

  public assertVectorClose(
    actual: Vector2,
    expected: Vector2,
    tolerance = 0.000001,
  ): void {
    this.assertClose(actual.x, expected.x, tolerance);
    this.assertClose(actual.y, expected.y, tolerance);
  }
}