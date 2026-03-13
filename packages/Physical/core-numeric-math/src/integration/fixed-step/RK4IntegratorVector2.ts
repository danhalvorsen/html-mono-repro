import { Vector2 } from "@monorepo/core-math";

import { NumericGuards } from "../../guards/NumericGuards.js";

import type { IFirstOrderDerivative2 } from "../../calculus/derivatives/IFirstOrderDerivative2.js";
import type { IIntegratorVector2 } from "../contracts/IIntegratorVector2.js";

export class RK4IntegratorVector2 implements IIntegratorVector2 {
  public step(
    derivative: IFirstOrderDerivative2,
    time: number,
    state: Vector2,
    stepSize: number
  ): Vector2 {
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