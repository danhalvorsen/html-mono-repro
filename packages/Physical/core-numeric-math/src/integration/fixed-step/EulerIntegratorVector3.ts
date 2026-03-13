import { Vector3 } from "@monorepo/core-math";

import { NumericGuards } from "../../guards/NumericGuards.js";

import type { IFirstOrderDerivative3 } from "../../calculus/derivatives/IFirstOrderDerivative3.js";
import type { IIntegratorVector3 } from "../contracts/IIntegratorVector3.js";

export class EulerIntegratorVector3 implements IIntegratorVector3 {
  public step(
    derivative: IFirstOrderDerivative3,
    time: number,
    state: Vector3,
    stepSize: number
  ): Vector3 {
    NumericGuards.ensureFinite(time, "time");
    NumericGuards.ensurePositive(stepSize, "stepSize");

    const delta = derivative.evaluate(time, state);

    return state.add(delta.scale(stepSize));
  }
}