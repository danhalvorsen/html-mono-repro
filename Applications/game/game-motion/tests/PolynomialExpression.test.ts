import { describe, it } from "vitest";
import { MotionTestFixture } from "./fixtures/MotionTestFixture";

describe("PolynomialExpression", () => {
  const fixture = new MotionTestFixture();

  it("should evaluate sparse polynomial terms", () => {
    const expression = fixture.createPolynomial([
      [2, 1],
      [0, 1],
    ]);

    expression.evaluateAt(3).should.equal(10);
  });

  it("should calculate the first derivative", () => {
    const expression = fixture.createPolynomial([
      [2, 1],
      [0, 1],
    ]);

    const derivative = expression.derivative();

    derivative.evaluateAt(3).should.equal(6);
  });

  it("should integrate with an integration constant", () => {
    const expression = fixture.createPolynomial([
      [1, 2],
      [0, 1],
    ]);

    const integrated = expression.integrate(4);

    integrated.evaluateAt(3).should.equal(16);
  });

  it("should normalize duplicate exponents", () => {
    const expression = fixture.createPolynomial([
      [2, 1],
      [2, 4],
      [0, 1],
    ]);

    expression.evaluateAt(2).should.equal(21);
  });
});
