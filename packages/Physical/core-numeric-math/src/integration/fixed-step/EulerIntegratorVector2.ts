import { Vector2 } from "@monorepo/core-math";

import { NumericGuards } from "../../guards/NumericGuards.js";

import type { IFirstOrderDerivative2 } from "../../calculus/derivatives/IFirstOrderDerivative2.js";
import type { IIntegratorVector2 } from "../contracts/IIntegratorVector2.js";

export class EulerIntegratorVector2 implements IIntegratorVector2 {
  public step(
    derivative: IFirstOrderDerivative2,
    time: number,
    state: Vector2,
    stepSize: number
  ): Vector2 {
    NumericGuards.ensureFinite(time, "time");
    NumericGuards.ensurePositive(stepSize, "stepSize");

    const delta = derivative.evaluate(time, state);

    return state.add(delta.scale(stepSize));
  }
}