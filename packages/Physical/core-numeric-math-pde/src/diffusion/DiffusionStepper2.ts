import { NumericGuards } from "@monorepo/core-numeric-math";
 import { IPdeStepper } from "../common/IPdeStepper.js";

import { IScalarFieldBuffer2 } from "../buffers/IScalarFieldBuffer2.js";
import { ILaplacianOperator2 } from "../operators/ILaplacianOperator2.js";
import { DiffusionState2 } from "./DiffusionState2.js";
import { DiffusionWorkspace2 } from "./DiffusionWorkspace2.js";

export class DiffusionStepper2 implements IPdeStepper<DiffusionState2, DiffusionWorkspace2> {
  public constructor(
    private readonly laplacianOperator: ILaplacianOperator2,
    private readonly fieldBuffer: IScalarFieldBuffer2,
    private readonly diffusivity: number
  ) {
    NumericGuards.ensurePositive(diffusivity, "diffusivity");
  }

  public step(state: DiffusionState2, workspace: DiffusionWorkspace2, timeStep: number): void {
    NumericGuards.ensurePositive(timeStep, "timeStep");

    this.laplacianOperator.apply(state.current, workspace.laplacian);

    const factor = this.diffusivity * timeStep;

    for (let j = 0; j < state.current.grid.height; j++) {
      for (let i = 0; i < state.current.grid.width; i++) {
        const next = state.current.sample(i, j) +
          (factor * workspace.laplacian.sample(i, j));

        state.next.write(i, j, next);
      }
    }

    this.fieldBuffer.swap(state.current, state.next);
  }
}
