import { describe, expect, it } from "vitest";
import { Vector2, Vector3 } from "@monorepo/core-math";

import { NumericGuards } from "../../src/index.js";
import { NumericTestFixture } from "../fixtures/NumericTestFixture.js";

describe("core.numeric.math", () => {
  const fixture = new NumericTestFixture();

  describe("NumericGuards", () => {
    it("should throw when finite validation fails", () => {
      expect(() => NumericGuards.ensureFinite(Number.NaN, "time"))
        .toThrowError("time must be finite.");
    });

    it("should throw when positive validation fails", () => {
      expect(() => NumericGuards.ensurePositive(0, "stepSize"))
        .toThrowError("stepSize must be a finite number greater than zero.");
    });

    it("should throw when non-negative integer validation fails", () => {
      expect(() => NumericGuards.ensureNonNegativeInteger(-1, "stepCount"))
        .toThrowError("stepCount must be a non-negative integer.");
    });
  });

  describe("EulerIntegratorVector2", () => {
    it("should integrate one step with a constant derivative", () => {
      const sut = fixture.createEulerIntegratorVector2();

      const result = sut.step(
        fixture.constantDerivative2,
        0,
        new Vector2(1, 2),
        0.5
      );

      expect(result.x).toBeCloseTo(2, 6);
      expect(result.y).toBeCloseTo(1.5, 6);
    });
  });

  describe("EulerIntegratorVector3", () => {
    it("should integrate one step with a constant derivative", () => {
      const sut = fixture.createEulerIntegratorVector3();

      const result = sut.step(
        fixture.constantDerivative3,
        0,
        new Vector3(1, 2, 3),
        0.5
      );

      expect(result.x).toBeCloseTo(2, 6);
      expect(result.y).toBeCloseTo(1.5, 6);
      expect(result.z).toBeCloseTo(5, 6);
    });
  });

  describe("RK4IntegratorVector2", () => {
    it("should integrate exponential decay accurately", () => {
      const sut = fixture.createRK4IntegratorVector2();

      const result = sut.step(
        fixture.decayDerivative2,
        0,
        new Vector2(1, 2),
        0.1
      );

      expect(result.x).toBeCloseTo(0.9048375, 5);
      expect(result.y).toBeCloseTo(1.8096750, 5);
    });
  });

  describe("RK4IntegratorVector3", () => {
    it("should integrate exponential decay accurately", () => {
      const sut = fixture.createRK4IntegratorVector3();

      const result = sut.step(
        fixture.decayDerivative3,
        0,
        new Vector3(1, 2, 3),
        0.1
      );

      expect(result.x).toBeCloseTo(0.9048375, 5);
      expect(result.y).toBeCloseTo(1.8096750, 5);
      expect(result.z).toBeCloseTo(2.7145125, 5);
    });
  });

  describe("StepSolverVector2", () => {
    it("should solve multiple steps with Euler", () => {
      const sut = fixture.createStepSolverVector2WithEuler();

      const result = sut.solve(
        fixture.constantDerivative2,
        0,
        new Vector2(0, 0),
        0.5,
        3
      );

      expect(result).toHaveLength(4);
      expect(result[0].time).toBeCloseTo(0, 6);
      expect(result[3].time).toBeCloseTo(1.5, 6);
      expect(result[3].state.x).toBeCloseTo(3, 6);
      expect(result[3].state.y).toBeCloseTo(-1.5, 6);
    });
  });

  describe("StepSolverVector3", () => {
    it("should solve multiple Euler steps with gravity", () => {
      const sut = fixture.createStepSolverVector3WithEuler();

      const result = sut.solve(
        fixture.gravityDerivative3,
        0,
        new Vector3(0, 10, 0),
        0.1,
        2
      );

      expect(result).toHaveLength(3);
      expect(result[1].time).toBeCloseTo(0.1, 6);
      expect(result[2].time).toBeCloseTo(0.2, 6);
      expect(result[2].state.x).toBeCloseTo(0, 6);
      expect(result[2].state.y).toBeCloseTo(8.038, 3);
      expect(result[2].state.z).toBeCloseTo(0, 6);
    });

    it("should solve multiple RK4 steps", () => {
      const sut = fixture.createStepSolverVector3WithRK4();

      const result = sut.solve(
        fixture.decayDerivative3,
        0,
        new Vector3(1, 2, 3),
        0.1,
        2
      );

      expect(result).toHaveLength(3);
      expect(result[2].state.x).toBeCloseTo(0.8187309, 5);
      expect(result[2].state.y).toBeCloseTo(1.6374618, 5);
      expect(result[2].state.z).toBeCloseTo(2.4561927, 5);
    });
  });
});