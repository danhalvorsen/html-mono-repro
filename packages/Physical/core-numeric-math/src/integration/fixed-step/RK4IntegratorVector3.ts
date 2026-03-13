import { Vector3 } from "@monorepo/core-math";

import { NumericGuards } from "../../guards/NumericGuards.js";

import type { IFirstOrderDerivative3 } from "../../calculus/derivatives/IFirstOrderDerivative3.js";
import type { IIntegratorVector3 } from "../contracts/IIntegratorVector3.js";

export class RK4IntegratorVector3 implements IIntegratorVector3 {
  public step(
    derivative: IFirstOrderDerivative3,
    time: number,
    state: Vector3,
    stepSize: number
  ): Vector3 {
    NumericGuards.ensureFinite(time, "time");
    NumericGuards.ensurePositive(stepSize, "stepSize");

    const halfStep = stepSize * 0.5;

    const k1 = derivative.evaluate(time, state);

    const k2 = derivative.evaluate(
      time + halfStep,
      state.add(k1.scale(halfStep))
    );

    const k3 = derivative.evaluate(
      time + halfStep,
      state.add(k2.scale(halfStep))
    );

    const k4 = derivative.evaluate(
      time + stepSize,
      state.add(k3.scale(stepSize))
    );

    const weighted = k1
      .scale(1 / 6)
      .add(k2.scale(1 / 3))
      .add(k3.scale(1 / 3))
      .add(k4.scale(1 / 6));

    return state.add(weighted.scale(stepSize));
  }
}