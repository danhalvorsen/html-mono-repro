import { Vector2, Vector3 } from "@monorepo/core-math";

import {
  EulerIntegratorVector2,
  EulerIntegratorVector3,
  RK4IntegratorVector2,
  RK4IntegratorVector3,
  StepSolverVector2,
  StepSolverVector3,
  type IFirstOrderDerivative2,
  type IFirstOrderDerivative3
} from "../../src/index.js";

export class ConstantDerivative2 implements IFirstOrderDerivative2 {
  public readonly order = 1;

  public constructor(
    private readonly derivative: Vector2
  ) {}

  public evaluate(_time: number, _state: Vector2): Vector2 {
    return this.derivative;
  }
}

export class ConstantDerivative3 implements IFirstOrderDerivative3 {
  public readonly order = 1;

  public constructor(
    private readonly derivative: Vector3
  ) {}

  public evaluate(_time: number, _state: Vector3): Vector3 {
    return this.derivative;
  }
}

export class DecayDerivative2 implements IFirstOrderDerivative2 {
  public readonly order = 1;

  public evaluate(_time: number, state: Vector2): Vector2 {
    return new Vector2(-state.x, -state.y);
  }
}

export class DecayDerivative3 implements IFirstOrderDerivative3 {
  public readonly order = 1;

  public evaluate(_time: number, state: Vector3): Vector3 {
    return new Vector3(-state.x, -state.y, -state.z);
  }
}

export class GravityDerivative3 implements IFirstOrderDerivative3 {
  public readonly order = 1;

  public evaluate(_time: number, _state: Vector3): Vector3 {
    return new Vector3(0, -9.81, 0);
  }
}

export class NumericTestFixture {
  public readonly constantDerivative2 = new ConstantDerivative2(new Vector2(2, -1));
  public readonly constantDerivative3 = new ConstantDerivative3(new Vector3(2, -1, 4));
  public readonly decayDerivative2 = new DecayDerivative2();
  public readonly decayDerivative3 = new DecayDerivative3();
  public readonly gravityDerivative3 = new GravityDerivative3();

  public createEulerIntegratorVector2(): EulerIntegratorVector2 {
    return new EulerIntegratorVector2();
  }

  public createEulerIntegratorVector3(): EulerIntegratorVector3 {
    return new EulerIntegratorVector3();
  }

  public createRK4IntegratorVector2(): RK4IntegratorVector2 {
    return new RK4IntegratorVector2();
  }

  public createRK4IntegratorVector3(): RK4IntegratorVector3 {
    return new RK4IntegratorVector3();
  }

  public createStepSolverVector2WithEuler(): StepSolverVector2 {
    return new StepSolverVector2(this.createEulerIntegratorVector2());
  }

  public createStepSolverVector3WithEuler(): StepSolverVector3 {
    return new StepSolverVector3(this.createEulerIntegratorVector3());
  }

  public createStepSolverVector3WithRK4(): StepSolverVector3 {
    return new StepSolverVector3(this.createRK4IntegratorVector3());
  }
}